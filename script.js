// 1. Constantes para Fatores de Carga Térmica e Conversão (VALIDADOS)
// Os fatores aqui correspondem à coluna "CARGA TÉRMICA" da sua primeira planilha.
const HEAT_GAIN_FACTORS = {
    "area_paredes_sol": 158,       // kcal/h por m²
    "area_paredes_sombra": 95,     // kcal/h por m²
    "area_janela_vidro_sol": 16,   // kcal/h por m²
    "area_janela_vidro_sol_cortina": 12, // kcal/h por m²
    "area_janela_vidro_sombra": 0, // kcal/h por m²
    "area_cobertura": 229,         // kcal/h por m²
    "area_piso_entre_andares": 0,  // kcal/h por m²
    "numero_pessoas": 13,     // kcal/h por pessoa
    "potencia_equipamentos": 1550, // Fator Fixo
    "potencia_iluminacao": 1200,   // Fator Fixo
    "vazao_ar_renovacao": 357       // kcal/h por m³/h
};

const BTU_PER_KCAL = 3.96832;
const BTU_PER_TR = 12000.0; // 1 Tonelada de Refrigeração = 12000 BTU/h

// Mapeamento para nomes amigáveis na exibição e valores padrão de ENTRADA (coluna "DADOS" da sua primeira planilha)
const PARCEL_DEFINITIONS = {
    "area_paredes_sol": { label: "Área de paredes ao SOL (m²)", default: 43 },
    "area_paredes_sombra": { label: "Área de paredes à sombra (m²)", default: 18 },
    "area_janela_vidro_sol": { label: "Área de janela ou porta de vidro ao sol (m²)", default: 520 },
    "area_janela_vidro_sol_cortina": { label: "Área de janela/porta vidro ao sol c/ cortina (m²)", default: 353 },
    "area_janela_vidro_sombra": { label: "Área de janela ou porta de vidro à sombra (m²)", default: 42 },
    "area_cobertura": { label: "Área de cobertura (m²)", default: 20 },
    "area_piso_entre_andares": { label: "Área de piso entre andares (m²)", default: 10 },
    "numero_pessoas": { label: "Número de pessoas", default: 100, isInteger: true },
    "potencia_equipamentos": { label: "Potência dos equipamentos (Kcal/h total)", default: 1 }, // Default: 1 (multiplicará pelo fator 1550)
    "potencia_iluminacao": { label: "Potência de iluminação (Kcal/h total)", default: 1 },     // Default: 1 (multiplicará pelo fator 1200)
    "vazao_ar_renovacao": { label: "Vazão de ar de renovação (m³/h)", default: 8.2 },
};

// 2. Referências aos elementos HTML de saída
const inputRowsContainer = document.getElementById('inputRows');
const totalKcalhSpan = document.getElementById('totalKcalh');
const totalBtuhSpan = document.getElementById('totalBtuh');
const totalTrSpan = document.getElementById('totalTr');
const errorMessagesDiv = document.getElementById('errorMessages');

// Armazena referências para os campos de input e spans de carga individual
const inputElements = {};
const calculatedLoadSpans = {};

// 3. Função para Gerar as Linhas de Entrada Dinamicamente
function generateInputRows() {
    for (const key in PARCEL_DEFINITIONS) {
        const parcel = PARCEL_DEFINITIONS[key];
        const factor = HEAT_GAIN_FACTORS[key];
        const defaultValue = parcel.default;

        const row = document.createElement('div');
        row.classList.add('table-row');
        row.dataset.key = key; // Guarda a chave para fácil acesso

        // Coluna 1: Fonte de Calor (Label)
        const labelDiv = document.createElement('span');
        labelDiv.classList.add('row-label', 'grid-col-1'); // Adiciona classe de grid
        labelDiv.textContent = parcel.label;
        row.appendChild(labelDiv);

        // Coluna 2: Quantidade (Input) - AGORA É O CAMPO DE ENTRADA
        const inputDiv = document.createElement('span');
        inputDiv.classList.add('row-input', 'grid-col-2'); // Adiciona classe de grid
        const input = document.createElement('input');
        input.type = "number";
        input.id = `input_${key}`; // ID único para cada input
        input.value = defaultValue; // Valor padrão da coluna "# FATOR" da planilha
        input.min = "0";
        // Para números inteiros (como 'Número de pessoas'), adiciona step="1"
        if (parcel.isInteger) {
            input.step = "1";
        } else {
            input.step = "any"; // Permite números decimais
        }
        
        // Adiciona um listener para recalcular automaticamente ao digitar
        input.addEventListener('input', calculateAndDisplayAll);
        inputDiv.appendChild(input);
        row.appendChild(inputDiv);
        
        // Armazena a referência do input
        inputElements[key] = input;

        // Coluna 3: Fator Fixo (Display) - AGORA É APENAS EXIBIÇÃO
        const factorDiv = document.createElement('span');
        factorDiv.classList.add('row-factor', 'grid-col-3'); // Adiciona classe de grid
        factorDiv.textContent = factor; // Fator da coluna "DADOS" da planilha
        factorDiv.dataset.label = 'Fator Fixo'; // Para responsividade em telas pequenas
        row.appendChild(factorDiv);

        // Coluna 4: Carga Térmica (Calculada - Display)
        const calculatedLoadDiv = document.createElement('span');
        calculatedLoadDiv.classList.add('row-calculated-load', 'grid-col-4'); // Adiciona classe de grid
        calculatedLoadDiv.textContent = '0'; // Valor inicial sem decimais
        calculatedLoadDiv.dataset.label = 'Carga Térmica (kcal/h)'; // Para responsividade em telas pequenas
        row.appendChild(calculatedLoadDiv);

        // Armazena a referência do span da carga calculada
        calculatedLoadSpans[key] = calculatedLoadDiv;

        inputRowsContainer.appendChild(row);
    }
}

// 4. Função para Obter Entradas do Usuário e Validar
function getInputs() {
    const inputs = {};
    let hasError = false;
    errorMessagesDiv.style.display = 'none'; // Esconde mensagens de erro anteriores
    errorMessagesDiv.innerHTML = ''; // Limpa mensagens de erro

    for (const key in PARCEL_DEFINITIONS) {
        const inputElement = inputElements[key]; // Pega a referência do input
        if (inputElement) {
            // Substitui vírgula por ponto para garantir que parseFloat funcione corretamente
            const value = parseFloat(inputElement.value.replace(',', '.')); 
            
            if (isNaN(value) || value < 0) { // Validação: precisa ser número e não negativo
                displayError(`"${PARCEL_DEFINITIONS[key].label}" deve ser um número válido e positivo.`);
                inputElement.classList.add('error-input'); // Adiciona classe para destaque visual
                hasError = true;
            } else {
                inputs[key] = value;
                inputElement.classList.remove('error-input'); // Remove destaque se corrigido
            }
        }
    }
    return hasError ? null : inputs; // Retorna null se houver erro
}

// Função auxiliar para exibir erros
function displayError(message) {
    errorMessagesDiv.style.display = 'block';
    const p = document.createElement('p');
    p.textContent = `- ${message}`;
    errorMessagesDiv.appendChild(p);
}

// 5. Função de Cálculo da Carga Térmica
function calculateThermalLoad(inputs) {
    const individualLoads = {};
    let totalKcalh = 0;

    for (const key in inputs) {
        const inputQuantity = inputs[key];
        const factor = HEAT_GAIN_FACTORS[key];
        
        // Verifica se o fator existe (deve existir para todas as 12 parcelas)
        if (factor !== undefined) {
            const calculatedLoad = inputQuantity * factor;
            individualLoads[key] = calculatedLoad;
            totalKcalh += calculatedLoad;
        } else {
            console.warn(`Fator não encontrado para a chave: ${key}`);
            individualLoads[key] = 0;
        }
    }

    const totalBtuh = totalKcalh * BTU_PER_KCAL;
    const totalTr = totalBtuh / BTU_PER_TR;

    return {
        individualLoads,
        totalKcalh,
        totalBtuh,
        totalTr
    };
}

// 6. Função para Exibir Resultados na UI
function displayResults(results) {
    // Resultados totais sem casas decimais (TR com 1 decimal como na imagem)
    totalKcalhSpan.textContent = results.totalKcalh.toFixed(0);
    totalBtuhSpan.textContent = results.totalBtuh.toFixed(0);
    totalTrSpan.textContent = results.totalTr.toFixed(1); 

    // Atualiza as cargas individuais na tabela sem casas decimais
    for (const key in results.individualLoads) {
        const span = calculatedLoadSpans[key];
        if (span) {
            span.textContent = results.individualLoads[key].toFixed(0);
        }
    }
}

// Função principal para calcular e exibir tudo
function calculateAndDisplayAll() {
    const inputs = getInputs();
    if (inputs) {
        const results = calculateThermalLoad(inputs);
        displayResults(results);
    } else {
        // Se houver erro, zera os resultados para evitar mostrar valores incorretos
        totalKcalhSpan.textContent = '0';
        totalBtuhSpan.textContent = '0';
        totalTrSpan.textContent = '0';
        for (const key in calculatedLoadSpans) {
            calculatedLoadSpans[key].textContent = '0';
        }
    }
}

// Inicialização: Gerar as linhas da tabela e fazer o cálculo inicial ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    generateInputRows(); // Cria os campos de input e spans
    calculateAndDisplayAll(); // Faz o cálculo inicial com os valores padrão
});

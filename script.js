// 1. Constantes para Fatores de Carga Térmica e Conversão (VALIDADOS)
const HEAT_GAIN_FACTORS = {
    "paredes_sol": 158,       // kcal/h por m²
    "paredes_sombra": 95,     // kcal/h por m²
    "janela_vidro_sol": 16,   // kcal/h por m²
    "janela_vidro_sol_cortina": 12, // kcal/h por m²
    "janela_vidro_sombra": 0, // kcal/h por m²
    "cobertura": 229,         // kcal/h por m²
    "piso_entre_andares": 0,  // kcal/h por m²
    "numero_pessoas": 13,     // kcal/h por pessoa
    "equipamentos_potencia": 1550, // kcal/h (assumindo que a entrada é o calor total)
    "iluminacao_potencia": 1200,   // kcal/h (assumindo que a entrada é o calor total)
    "ar_renovacao": 357       // kcal/h por m³/h
};

const BTU_PER_KCAL = 3.96832;
const BTU_PER_TR = 12000.0; // 1 Tonelada de Refrigeração = 12000 BTU/h

// Mapeamento para nomes amigáveis na exibição
const DISPLAY_NAMES = {
    "paredes_sol": "Área de paredes ao SOL",
    "paredes_sombra": "Área de paredes à sombra",
    "janela_vidro_sol": "Área de janela ou porta de vidro ao sol",
    "janela_vidro_sol_cortina": "Área de janela/porta vidro ao sol c/ cortina",
    "janela_vidro_sombra": "Área de janela ou porta de vidro à sombra",
    "cobertura": "Área de cobertura",
    "piso_entre_andares": "Área de piso entre andares",
    "numero_pessoas": "Número de pessoas",
    "equipamentos_potencia": "Potência dos equipamentos",
    "iluminacao_potencia": "Potência de iluminação",
    "ar_renovacao": "Vazão de ar de renovação (m³/h)"
};

// 2. Referências aos elementos HTML
const inputIds = {
    area_paredes_sol: 'areaParedesSol',
    area_paredes_sombra: 'areaParedesSombra',
    area_janela_vidro_sol: 'areaJanelaVidroSol',
    area_janela_vidro_sol_cortina: 'areaJanelaVidroSolCortina',
    area_janela_vidro_sombra: 'areaJanelaVidroSombra',
    area_cobertura: 'areaCobertura',
    area_piso_entre_andares: 'areaPisoEntreAndares',
    numero_pessoas: 'numeroPessoas',
    potencia_equipamentos: 'potenciaEquipamentos',
    potencia_iluminacao: 'potenciaIluminacao',
    vazao_ar_renovacao: 'vazaoArRenovacao'
};

const calculateButton = document.getElementById('calculateButton');
const totalKcalhSpan = document.getElementById('totalKcalh');
const totalBtuhSpan = document.getElementById('totalBtuh');
const totalTrSpan = document.getElementById('totalTr');
const individualLoadsListDiv = document.getElementById('individualLoadsList');
const errorMessagesDiv = document.getElementById('errorMessages');

// 3. Função para Obter Entradas do Usuário
function getInputs() {
    const inputs = {};
    let hasError = false;
    errorMessagesDiv.style.display = 'none'; // Esconde mensagens de erro anteriores
    errorMessagesDiv.innerHTML = ''; // Limpa mensagens de erro

    for (const key in inputIds) {
        const inputElement = document.getElementById(inputIds[key]);
        if (inputElement) {
            // Substitui vírgula por ponto para garantir que parseFloat funcione corretamente
            const value = parseFloat(inputElement.value.replace(',', '.')); 
            if (isNaN(value) || value < 0) { // Validação: precisa ser número e não negativo
                displayError(`"${DISPLAY_NAMES[key]}" deve ser um número positivo.`);
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
    p.textContent = `* ${message}`;
    errorMessagesDiv.appendChild(p);
}


// 4. Função de Cálculo da Carga Térmica
function calculateThermalLoad(inputs) {
    const individualLoads = {};
    let totalKcalh = 0;

    individualLoads.paredes_sol = inputs.area_paredes_sol * HEAT_GAIN_FACTORS.paredes_sol;
    individualLoads.paredes_sombra = inputs.area_paredes_sombra * HEAT_GAIN_FACTORS.paredes_sombra;
    individualLoads.janela_vidro_sol = inputs.area_janela_vidro_sol * HEAT_GAIN_FACTORS.janela_vidro_sol;
    individualLoads.janela_vidro_sol_cortina = inputs.area_janela_vidro_sol_cortina * HEAT_GAIN_FACTORS.janela_vidro_sol_cortina;
    individualLoads.janela_vidro_sombra = inputs.area_janela_vidro_sombra * HEAT_GAIN_FACTORS.janela_vidro_sombra;
    individualLoads.cobertura = inputs.area_cobertura * HEAT_GAIN_FACTORS.cobertura;
    individualLoads.piso_entre_andares = inputs.area_piso_entre_andares * HEAT_GAIN_FACTORS.piso_entre_andares;
    individualLoads.numero_pessoas = inputs.numero_pessoas * HEAT_GAIN_FACTORS.numero_pessoas;
    individualLoads.equipamentos_potencia = inputs.potencia_equipamentos; // Já em Kcal/h
    individualLoads.iluminacao_potencia = inputs.iluminacao_potencia;     // Já em Kcal/h
    individualLoads.ar_renovacao = inputs.vazao_ar_renovacao * HEAT_GAIN_FACTORS.ar_renovacao;

    // Soma todas as cargas individuais
    for (const key in individualLoads) {
        totalKcalh += individualLoads[key];
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

// 5. Função para Exibir Resultados na UI
function displayResults(results) {
    totalKcalhSpan.textContent = results.totalKcalh.toFixed(2);
    totalBtuhSpan.textContent = results.totalBtuh.toFixed(2);
    totalTrSpan.textContent = results.totalTr.toFixed(2);

    // Limpa a lista anterior de cargas individuais
    individualLoadsListDiv.innerHTML = '';

    // Preenche a lista de cargas individuais
    for (const key in results.individualLoads) {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('individual-load-item');

        const nameSpan = document.createElement('span');
        nameSpan.textContent = DISPLAY_NAMES[key] || key.replace(/_/g, ' '); // Usa nome amigável ou formata a chave

        const valueSpan = document.createElement('span');
        valueSpan.classList.add('individual-load-value');
        valueSpan.textContent = `${results.individualLoads[key].toFixed(2)} kcal/h`;

        itemDiv.appendChild(nameSpan);
        itemDiv.appendChild(valueSpan);
        individualLoadsListDiv.appendChild(itemDiv);
    }
}

// 6. Lógica Principal: Adicionar Event Listener ao Botão
// Isso faz com que a função calcular seja chamada quando o botão é clicado.
calculateButton.addEventListener('click', () => {
    const inputs = getInputs(); // Tenta obter as entradas
    if (inputs) { // Se não houver erros nas entradas
        const results = calculateThermalLoad(inputs);
        displayResults(results);
    } else {
        // Erros já foram exibidos pela função getInputs()
    }
});

// Opcional: Calcular automaticamente ao carregar a página com os valores padrão
// E também recalcular ao mudar os valores nos campos (para uma experiência mais dinâmica)
document.addEventListener('DOMContentLoaded', () => {
    const initialInputs = getInputs();
    if (initialInputs) {
        const initialResults = calculateThermalLoad(initialInputs);
        displayResults(initialResults);
    }

    // Adiciona event listener para cada campo de input para recalcular ao mudar
    for (const key in inputIds) {
        const inputElement = document.getElementById(inputIds[key]);
        if (inputElement) {
            inputElement.addEventListener('input', () => {
                const updatedInputs = getInputs();
                if (updatedInputs) {
                    const updatedResults = calculateThermalLoad(updatedInputs);
                    displayResults(updatedResults);
                }
            });
        }
    }
});

// Aguarda o carregamento completo do DOM para iniciar o script
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Constantes para Fatores de Carga Térmica e Conversão (VALIDADOS)
    const HEAT_GAIN_FACTORS = {
        "area_paredes_sol": 158,                 // kcal/h por m²
        "area_paredes_sombra": 95,               // kcal/h por m²
        "area_janela_vidro_sol": 520,            // kcal/h por m²
        "area_janela_vidro_sol_cortina": 353,    // kcal/h por m²
        "area_janela_vidro_sombra": 42,          // kcal/h por m²
        "area_cobertura": 20,                    // kcal/h por m²
        "area_piso_entre_andares": 10,           // kcal/h por m²
        "numero_pessoas": 100,                   // kcal/h por pessoa
        "potencia_equipamentos": 1550,           // Fator Fixo Kcal/h
        "potencia_iluminacao": 1200,             // Fator Fixo Kcal/h
        "vazao_ar_renovacao": 8.2                // kcal/h por m³/h
    };

    const BTU_PER_KCAL = 3.96832;
    const BTU_PER_TR = 12000.0;

    // Mapeamento para nomes amigáveis e valores padrão de entrada
    const PARCEL_DEFINITIONS = {
        "area_paredes_sol": { label: "Área de paredes ao SOL (m²)", default: 43 },
        "area_paredes_sombra": { label: "Área de paredes à sombra (m²)", default: 18 },
        "area_janela_vidro_sol": { label: "Área de janela ou porta de vidro ao sol (m²)", default: 16 },
        "area_janela_vidro_sol_cortina": { label: "Área de janela/porta vidro ao sol c/ cortina (m²)", default: 12 },
        "area_janela_vidro_sombra": { label: "Área de janela ou porta de vidro à sombra (m²)", default: 0 },
        "area_cobertura": { label: "Área de cobertura (m²)", default: 229 },
        "area_piso_entre_andares": { label: "Área de piso entre andares (m²)", default: 0 },
        "numero_pessoas": { label: "Número de pessoas", default: 13, isInteger: true },
        // AJUSTE: Rótulo mais claro para indicar que o valor '1' usa o fator padrão.
        "potencia_equipamentos": { label: "Fator para Equipamentos (use 1 para padrão)", default: 1 },
        "potencia_iluminacao": { label: "Fator para Iluminação (use 1 para padrão)", default: 1 },
        "vazao_ar_renovacao": { label: "Vazão de ar de renovação (m³/h)", default: 357 },
    };

    // 2. Referências aos elementos HTML
    const inputRowsContainer = document.getElementById('inputRows');
    const totalKcalhSpan = document.getElementById('totalKcalh');
    const totalBtuhSpan = document.getElementById('totalBtuh');
    const totalTrSpan = document.getElementById('totalTr');
    const errorMessagesDiv = document.getElementById('errorMessages');

    const inputElements = {};
    const calculatedLoadSpans = {};

    // 3. Gera as Linhas de Entrada Dinamicamente
    function generateInputRows() {
        for (const key in PARCEL_DEFINITIONS) {
            const parcel = PARCEL_DEFINITIONS[key];
            const factor = HEAT_GAIN_FACTORS[key];

            const row = document.createElement('div');
            row.classList.add('table-row');
            
            // Coluna 1: Rótulo
            row.innerHTML = `
                <span class="row-label">${parcel.label}</span>
                <span class="row-input">
                    <input type="number" id="input_${key}" value="${parcel.default}" min="0" step="${parcel.isInteger ? '1' : 'any'}">
                </span>
                <span class="row-factor" data-label="Fator Fixo">${factor}</span>
                <span class="row-calculated-load" data-label="Carga Térmica (kcal/h)">0</span>
            `;

            inputRowsContainer.appendChild(row);

            // Armazena referências e adiciona listener
            const input = document.getElementById(`input_${key}`);
            inputElements[key] = input;
            calculatedLoadSpans[key] = row.querySelector('.row-calculated-load');
            input.addEventListener('input', calculateAndDisplayAll);
        }
    }

    // 4. Obtém e Valida as Entradas do Usuário
    function getInputs() {
        const inputs = {};
        let hasError = false;
        errorMessagesDiv.style.display = 'none';
        errorMessagesDiv.innerHTML = '';

        for (const key in PARCEL_DEFINITIONS) {
            const inputElement = inputElements[key];
            const valueStr = inputElement.value.replace(',', '.');
            const value = parseFloat(valueStr);

            if (isNaN(value) || value < 0) {
                displayError(`Valor inválido para "${PARCEL_DEFINITIONS[key].label}". Use apenas números positivos.`);
                inputElement.classList.add('error-input');
                hasError = true;
            } else {
                inputs[key] = value;
                inputElement.classList.remove('error-input');
            }
        }
        return hasError ? null : inputs;
    }
    
    // Função auxiliar para mostrar erros
    function displayError(message) {
        errorMessagesDiv.style.display = 'block';
        errorMessagesDiv.innerHTML += `<p>${message}</p>`;
    }

    // 5. Calcula a Carga Térmica
    function calculateThermalLoad(inputs) {
        const individualLoads = {};
        let totalKcalh = 0;

        for (const key in inputs) {
            const calculatedLoad = inputs[key] * HEAT_GAIN_FACTORS[key];
            individualLoads[key] = calculatedLoad;
            totalKcalh += calculatedLoad;
        }

        const totalBtuh = totalKcalh * BTU_PER_KCAL;
        const totalTr = totalBtuh / BTU_PER_TR;

        return { individualLoads, totalKcalh, totalBtuh, totalTr };
    }

    // 6. Exibe os Resultados na Interface
    function displayResults(results) {
        totalKcalhSpan.textContent = results.totalKcalh.toFixed(0);
        totalBtuhSpan.textContent = results.totalBtuh.toFixed(0);
        totalTrSpan.textContent = results.totalTr.toFixed(1);

        for (const key in results.individualLoads) {
            calculatedLoadSpans[key].textContent = results.individualLoads[key].toFixed(0);
        }
    }

    // Função principal que orquestra o cálculo e a exibição
    function calculateAndDisplayAll() {
        const inputs = getInputs();
        if (inputs) {
            const results = calculateThermalLoad(inputs);
            displayResults(results);
        } else {
            // Zera os resultados se houver erro de validação
            displayResults({ totalKcalh: 0, totalBtuh: 0, totalTr: 0, individualLoads: {} });
        }
    }

    // Inicialização da aplicação
    generateInputRows();
    calculateAndDisplayAll();
});

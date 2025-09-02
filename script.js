// Aguarda o carregamento completo do DOM para iniciar o script
document.addEventListener('DOMContentLoaded', () => {

    // 1. Constantes com os valores ajustados conforme a imagem da planilha.
    // HEAT_GAIN_FACTORS corresponde à coluna "Fator".
    const HEAT_GAIN_FACTORS = {
        "parede_norte": 28,
        "parede_oeste": 35,
        "parede_sul_sombra": 18,
        "parede_leste_sombra": 18,
        "cobertura": 30,
        "piso_entre_andares": 14,
        "parede_interna": 10,
        "vidro_norte_sem_cortina": 329,
        "vidro_oeste_sem_cortina": 735,
        "vidro_norte_com_cortina": 186,
        "vidro_oeste_com_cortina": 389,
        "vidro_sombra": 42,
        "pessoas_trabalho_leve": 115,
        "iluminacao": 1,
        "equipamentos": 1,
        "ar_externo_renovacao": 9
    };

    // Fatores de conversão
    const WATTS_TO_KCALH = 0.86; // 1 Watt equivale a aproximadamente 0.86 kcal/h
    const KCALH_TO_BTUH = 3.968;
    const BTUH_TO_TR = 12000;

    // PARCEL_DEFINITIONS define os rótulos para a interface do usuário.
    const PARCEL_DEFINITIONS = {
        "parede_norte": { label: "Parede Norte (m²)", default: 0 },
        "parede_oeste": { label: "Parede Oeste (m²)", default: 0 },
        "parede_sul_sombra": { label: "Parede Sul - sombra (m²)", default: 0 },
        "parede_leste_sombra": { label: "Parede Leste - sombra (m²)", default: 0 },
        "cobertura": { label: "Cobertura (m²)", default: 0 },
        "piso_entre_andares": { label: "Piso entre andares (m²)", default: 0 },
        "parede_interna": { label: "Parede interna (m²)", default: 0 },
        "vidro_norte_sem_cortina": { label: "Vidro ao Norte sem cortina (m²)", default: 0 },
        "vidro_oeste_sem_cortina": { label: "Vidro ao Oeste sem cortina (m²)", default: 0 },
        "vidro_norte_com_cortina": { label: "Vidro ao Norte com cortina interna (m²)", default: 0 },
        "vidro_oeste_com_cortina": { label: "Vidro ao Oeste com cortina interna (m²)", default: 0 },
        "vidro_sombra": { label: "vidro à sombra (m²)", default: 0 },
        "pessoas_trabalho_leve": { label: "pessoas trabalho leve (número)", default: 0, isInteger: true },
        "iluminacao": { label: "iluminação (W)", default: 0 },
        "equipamentos": { label: "equipamentos (W)", default: 0 },
        "ar_externo_renovacao": { label: "ar externo de renovação (m³/h)", default: 0 }
    };

    // 2. Referências aos elementos HTML (assumindo que você terá elementos com esses IDs)
    const inputRowsContainer = document.getElementById('inputRows');
    const totalWattsSpan = document.getElementById('totalWatts');
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
            row.classList.add('table-row'); // Para estilização via CSS

            row.innerHTML = `
                <span class="row-label">${parcel.label}</span>
                <span class="row-input">
                    <input type="number" id="input_${key}" value="${parcel.default}" min="0" step="${parcel.isInteger ? '1' : 'any'}">
                </span>
                <span class="row-factor">${factor}</span>
                <span class="row-calculated-load" id="load_${key}">0</span>
            `;

            inputRowsContainer.appendChild(row);

            const input = document.getElementById(`input_${key}`);
            inputElements[key] = input;
            calculatedLoadSpans[key] = document.getElementById(`load_${key}`);
            input.addEventListener('input', calculateAndDisplayAll);
        }
    }

    // 4. Obtém e Valida as Entradas do Usuário
    function getInputs() {
        const inputs = {};
        let hasError = false;
        if (errorMessagesDiv) {
            errorMessagesDiv.style.display = 'none';
            errorMessagesDiv.innerHTML = '';
        }

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

    function displayError(message) {
        if (errorMessagesDiv) {
            errorMessagesDiv.style.display = 'block';
            errorMessagesDiv.innerHTML += `<p>${message}</p>`;
        }
    }

    // 5. Calcula a Carga Térmica
    function calculateThermalLoad(inputs) {
        const individualLoads = {};
        let totalWatts = 0;

        for (const key in inputs) {
            const factor = HEAT_GAIN_FACTORS[key];
            const value = inputs[key];
            let calculatedLoad = 0;

            if (factor !== undefined) {
                calculatedLoad = value * factor;
            }

            individualLoads[key] = calculatedLoad;
            totalWatts += calculatedLoad;
        }

        const totalKcalh = totalWatts * WATTS_TO_KCALH;
        const totalBtuh = totalKcalh * KCALH_TO_BTUH;
        const totalTr = totalBtuh / BTUH_TO_TR;

        return { individualLoads, totalWatts, totalKcalh, totalBtuh, totalTr };
    }

    // 6. Exibe os Resultados na Interface
    function displayResults(results) {
        if (totalWattsSpan) totalWattsSpan.textContent = results.totalWatts.toFixed(0);
        if (totalKcalhSpan) totalKcalhSpan.textContent = results.totalKcalh.toFixed(0);
        if (totalBtuhSpan) totalBtuhSpan.textContent = results.totalBtuh.toFixed(0);
        if (totalTrSpan) totalTrSpan.textContent = results.totalTr.toFixed(1);

        for (const key in results.individualLoads) {
            if (calculatedLoadSpans[key]) {
                calculatedLoadSpans[key].textContent = results.individualLoads[key].toFixed(0);
            }
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
            const emptyResults = { totalWatts: 0, totalKcalh: 0, totalBtuh: 0, totalTr: 0, individualLoads: {} };
            // Preenche os campos individuais com 0
            for (const key in PARCEL_DEFINITIONS) {
                emptyResults.individualLoads[key] = 0;
            }
            displayResults(emptyResults);
        }
    }

    // Inicialização da aplicação
    if (inputRowsContainer) {
        generateInputRows();
        calculateAndDisplayAll();
    }
});

// 1. Constantes de Fatores de Carga e Conversão
const HEAT_GAIN_FACTORS = {
    area_paredes_sol: 158,
    area_paredes_sombra: 95,
    area_janela_vidro_sol: 16,
    area_janela_vidro_sol_cortina: 12,
    area_janela_vidro_sombra: 0,
    area_cobertura: 229,
    area_piso_entre_andares: 0,
    numero_pessoas: 13,
    potencia_equipamentos: 1550,
    potencia_iluminacao: 1200,
    vazao_ar_renovacao: 357
};

const BTU_PER_KCAL = 3.96832;
const BTU_PER_TR = 12000;

// 2. Definições para cada entrada do usuário
const PARCEL_DEFINITIONS = {
    area_paredes_sol: { label: "Área de paredes ao SOL (m²)", default: 43 },
    area_paredes_sombra: { label: "Área de paredes à sombra (m²)", default: 18 },
    area_janela_vidro_sol: { label: "Área de janela ou porta de vidro ao sol (m²)", default: 520 },
    area_janela_vidro_sol_cortina: { label: "Área de janela/porta vidro ao sol c/ cortina (m²)", default: 353 },
    area_janela_vidro_sombra: { label: "Área de janela ou porta de vidro à sombra (m²)", default: 42 },
    area_cobertura: { label: "Área de cobertura (m²)", default: 20 },
    area_piso_entre_andares: { label: "Área de piso entre andares (m²)", default: 10 },
    numero_pessoas: { label: "Número de pessoas", default: 100, isInteger: true },
    potencia_equipamentos: { label: "Potência dos equipamentos (Kcal/h total)", default: 1 },
    potencia_iluminacao: { label: "Potência de iluminação (Kcal/h total)", default: 1 },
    vazao_ar_renovacao: { label: "Vazão de ar de renovação (m³/h)", default: 8.2 }
};

// 3. Elementos HTML de saída
const inputRowsContainer = document.getElementById('inputRows');
const totalKcalhSpan = document.getElementById('totalKcalh');
const totalBtuhSpan = document.getElementById('totalBtuh');
const totalTrSpan = document.getElementById('totalTr');
const errorMessagesDiv = document.getElementById('errorMessages');

// Armazenamento de referências
const inputElements = {};
const calculatedLoadSpans = {};

// 4. Criação dinâmica dos campos de entrada
function generateInputRows() {
    for (const key in PARCEL_DEFINITIONS) {
        const parcel = PARCEL_DEFINITIONS[key];
        const factor = HEAT_GAIN_FACTORS[key];
        const defaultValue = parcel.default;

        const row = document.createElement('div');
        row.classList.add('table-row');
        row.dataset.key = key;

        // Fonte de calor (coluna 1)
        const labelDiv = document.createElement('span');
        labelDiv.classList.add('row-label', 'grid-col-1');
        labelDiv.textContent = parcel.label;
        row.appendChild(labelDiv);

        // Campo de entrada (coluna 2)
        const inputDiv = document.createElement('span');
        inputDiv.classList.add('row-input', 'grid-col-2');
        const input = document.createElement('input');
        input.type = "number";
        input.id = `input_${key}`;
        input.value = defaultValue;
        input.min = "0";
        input.step = parcel.isInteger ? "1" : "any";
        input.addEventListener('input', calculateAndDisplayAll);
        inputDiv.appendChild(input);
        row.appendChild(inputDiv);
        inputElements[key] = input;

        // Fator fixo (coluna 3)
        const factorDiv = document.createElement('span');
        factorDiv.classList.add('row-factor', 'grid-col-3');
        factorDiv.textContent = factor;
        factorDiv.dataset.label = 'Fator Fixo';
        row.appendChild(factorDiv);

        // Resultado da carga (coluna 4)
        const loadDiv = document.createElement('span');
        loadDiv.classList.add('row-calculated-load', 'grid-col-4');
        loadDiv.textContent = '0';
        loadDiv.dataset.label = 'Carga Térmica (kcal/h)';
        row.appendChild(loadDiv);
        calculatedLoadSpans[key] = loadDiv;

        inputRowsContainer.appendChild(row);
    }
}

// 5. Validação dos dados inseridos
function getInputs() {
    const inputs = {};
    let hasError = false;
    errorMessagesDiv.style.display = 'none';
    errorMessagesDiv.innerHTML = '';

    for (const key in PARCEL_DEFINITIONS) {
        const input = inputElements[key];
        const value = parseFloat(input.value.replace(',', '.'));
        if (isNaN(value) || value < 0) {
            displayError(`"${PARCEL_DEFINITIONS[key].label}" deve ser um número válido e positivo.`);
            input.classList.add('error-input');
            hasError = true;
        } else {
            inputs[key] = value;
            input.classList.remove('error-input');
        }
    }

    return hasError ? null : inputs;
}

// Exibição de erros
function displayError(message) {
    errorMessagesDiv.style.display = 'block';
    const p = document.createElement('p');
    p.textContent = `- ${message}`;
    errorMessagesDiv.appendChild(p);
}

// 6. Cálculo da carga térmica total
function calculateThermalLoad(inputs) {
    const individualLoads = {};
    let totalKcalh = 0;

    for (const key in inputs) {
        const value = inputs[key];
        const factor = HEAT_GAIN_FACTORS[key];
        const carga = value * factor;
        individualLoads[key] = carga;
        totalKcalh += carga;
    }

    const totalBtuh = totalKcalh * BTU_PER_KCAL;
    const totalTr = totalBtuh / BTU_PER_TR;

    return {
        individualLoads,
        totalKcalh,
        totalBtuh,
       

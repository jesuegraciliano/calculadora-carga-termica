// Fatores de ganho de calor e conversão
const HEAT_GAIN_FACTORS = {
  paredes_sol: 158,
  paredes_sombra: 95,
  janela_vidro_sol: 16,
  janela_vidro_sol_cortina: 12,
  janela_vidro_sombra: 0,
  cobertura: 229,
  piso_entre_andares: 0,
  numero_pessoas: 13,
  equipamentos_potencia: 1, // multiplicador direto
  iluminacao_potencia: 1,
  ar_renovacao: 357
};

const BTU_PER_KCAL = 3.96832;
const BTU_PER_TR = 12000;

const DISPLAY_NAMES = {
  paredes_sol: "Área de paredes ao SOL",
  paredes_sombra: "Área de paredes à sombra",
  janela_vidro_sol: "Área de janela ou porta de vidro ao sol",
  janela_vidro_sol_cortina: "Área de janela/porta vidro ao sol c/ cortina",
  janela_vidro_sombra: "Área de janela ou porta de vidro à sombra",
  cobertura: "Área de cobertura",
  piso_entre_andares: "Área de piso entre andares",
  numero_pessoas: "Número de pessoas",
  equipamentos_potencia: "Potência dos equipamentos",
  iluminacao_potencia: "Potência de iluminação",
  ar_renovacao: "Vazão de ar de renovação (m³/h)"
};

const inputIds = {
  paredes_sol: 'areaParedesSol',
  paredes_sombra: 'areaParedesSombra',
  janela_vidro_sol: 'areaJanelaVidroSol',
  janela_vidro_sol_cortina: 'areaJanelaVidroSolCortina',
  janela_vidro_sombra: 'areaJanelaVidroSombra',
  cobertura: 'areaCobertura',
  piso_entre_andares: 'areaPisoEntreAndares',
  numero_pessoas: 'numeroPessoas',
  equipamentos_potencia: 'potenciaEquipamentos',
  iluminacao_potencia: 'potenciaIluminacao',
  ar_renovacao: 'vazaoArRenovacao'
};

const calculateButton = document.getElementById('calculateButton');
const totalKcalhSpan = document.getElementById('totalKcalh');
const totalBtuhSpan = document.getElementById('totalBtuh');
const totalTrSpan = document.getElementById('totalTr');
const individualLoadsListDiv = document.getElementById('individualLoadsList');
const errorMessagesDiv = document.getElementById('errorMessages');

// Coleta e validação dos dados
function getInputs() {
  const inputs = {};
  let hasError = false;
  errorMessagesDiv.style.display = 'none';
  errorMessagesDiv.innerHTML = '';

  for (const key in inputIds) {
    const inputElement = document.getElementById(inputIds[key]);
    let value = parseFloat(inputElement.value.replace(',', '.'));

    if (isNaN(value) || value < 0) {
      displayError(`"${DISPLAY_NAMES[key]}" deve ser um número positivo.`);
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
  errorMessagesDiv.style.display = 'block';
  const p = document.createElement('p');
  p.textContent = `* ${message}`;
  errorMessagesDiv.appendChild(p);
}

// Cálculo principal
function calculateThermalLoad(inputs) {
  const individualLoads = {};
  let totalKcalh = 0;

  for (const key in inputs) {
    const factor = HEAT_GAIN_FACTORS[key];
    individualLoads[key] = inputs[key] * factor;
    totalKcalh += individualLoads[key];
  }

  return {
    individualLoads,
    totalKcalh,
    totalBtuh: totalKcalh * BTU_PER_KCAL,
    totalTr: (totalKcalh * BTU_PER_KCAL) / BTU_PER_TR
  };
}

// Exibição dos resultados
function displayResults(results) {
  totalKcalhSpan.textContent = results.totalKcalh.toFixed(2);
  totalBtuhSpan.textContent = results.totalBtuh.toFixed(2);
  totalTrSpan.textContent = results.totalTr.toFixed(2);

  individualLoadsListDiv.innerHTML = '';

  for (const key in results.individualLoads) {
    const item = document.createElement('div');
    item.className = 'individual-load-item';
    item.innerHTML = `
      <span>${DISPLAY_NAMES[key]}</span>
      <span class="individual-load-value">${results.individualLoads[key].toFixed(2)} kcal/h</span>
    `;
    individualLoadsListDiv.appendChild(item);
  }
}

// Gatilho principal
calculateButton.addEventListener('click', () => {
  const inputs = getInputs();
  if (inputs) {
    const results = calculateThermalLoad(inputs);
    displayResults(results);
  }
});

// Cálculo automático ao carregar
document.addEventListener('DOMContentLoaded', () => {
  const inputs = getInputs();
  if (inputs) {
    const results = calculateThermalLoad(inputs);
    displayResults(results);
  }
});

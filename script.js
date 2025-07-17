document.addEventListener("DOMContentLoaded", function () {
  const thermalData = [
    { label: "Área de paredes ao SOL", fator: 158, id: "dado1" },
    { label: "Área de paredes à sombra", fator: 95, id: "dado2" },
    { label: "Área de janela ou porta de vidro ao sol", fator: 16, id: "dado3" },
    { label: "Área de janela ou porta vidro ao sol com cortina", fator: 12, id: "dado4" },
    { label: "Área de janela ou porta de vidro à sombra", fator: 0, id: "dado5" },
    { label: "Área de cobertura", fator: 229, id: "dado6" },
    { label: "Área de piso entre andares", fator: 0, id: "dado7" },
    { label: "Número de pessoas", fator: 13, id: "dado8" },
    { label: "Potência dos equipamentos", fator: 1, id: "dado9" },
    { label: "Potência de iluminação", fator: 1, id: "dado10" },
    { label: "Vazão de ar de renovação (m³/h)", fator: 357, id: "dado11" }
  ];

  const tableBody = document.getElementById("thermalBody");
  const container = document.querySelector(".container");

  function createRow(item) {
    const tr = document.createElement("tr");

    const tdLabel = document.createElement("td");
    tdLabel.textContent = item.label;

    const tdInput = document.createElement("td");
    const input = document.createElement("input");
    input.type = "number";
    input.placeholder = "0";
    input.classList.add("input");
    input.id = item.id;
    input.addEventListener("input", calcularCarga);
    tdInput.appendChild(input);

    const tdFator = document.createElement("td");
    tdFator.textContent = item.fator;
    tdFator.classList.add("fixed");

    const tdResultado = document.createElement("td");
    tdResultado.textContent = "0.00";
    tdResultado.id = item.id + "_resultado";
    tdResultado.classList.add("output");

    tr.appendChild(tdLabel);
    tr.appendChild(tdInput);
    tr.appendChild(tdFator);
    tr.appendChild(tdResultado);

    tableBody.appendChild(tr);
  }

  function calcularCarga() {
    let total = 0;

    thermalData.forEach(item => {
      const input = document.getElementById(item.id);
      const valor = parseFloat(input.value.replace(",", ".")) || 0;
      const carga = valor * item.fator;
      total += carga;

      const resultado = document.getElementById(item.id + "_resultado");
      resultado.textContent = carga.toFixed(2);
    });

    const totalKcal = document.getElementById("totalKcalh");
    totalKcal.textContent = total.toFixed(2) + " kcal/h";

    const tr = total / 3000;
    const btuh = tr * 12000;

    const totalTR = document.getElementById("totalTR");
    totalTR.textContent = `${tr.toFixed(2)} TR  |  ${btuh.toFixed(2)} BTU/h`;
  }

  thermalData.forEach(createRow);
  calcularCarga();
});

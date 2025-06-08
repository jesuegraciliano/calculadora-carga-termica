document.addEventListener("DOMContentLoaded", function () {
    const thermalData = [
        { label: "Área de paredes ao SOL", fator: 158, id: "dado1", dado: 43 },
        { label: "Área de paredes à sombra", fator: 95, id: "dado2", dado: 18 },
        { label: "Área de janela ou porta de vidro ao sol", fator: 16, id: "dado3", dado: 520 },
        { label: "Área de janela ou porta vidro ao sol com cortina", fator: 12, id: "dado4", dado: 353 },
        { label: "Área de janela ou porta de vidro à sombra", fator: 0, id: "dado5", dado: 42 },
        { label: "Área de cobertura", fator: 229, id: "dado6", dado: 20 },
        { label: "Área de piso entre andares", fator: 0, id: "dado7", dado: 10 },
        { label: "Número de pessoas", fator: 13, id: "dado8", dado: 100 },
        { label: "Potência dos equipamentos", fator: 1550, id: "dado9", dado: 1 },
        { label: "Potência de iluminação", fator: 1200, id: "dado10", dado: 1 },
        { label: "Vazão de ar de renovação (m³/h)", fator: 357, id: "dado11", dado: 8.2 }
    ];

    const container = document.querySelector(".container");
    const tableBody = document.getElementById("thermalBody");

    function createRow(item) {
        const tr = document.createElement("tr");

        const tdLabel = document.createElement("td");
        tdLabel.textContent = item.label;

        const tdInput = document.createElement("td");
        const input = document.createElement("input");
        input.type = "number";
        input.id = item.id;
        input.value = item.dado;
        input.classList.add("input");
        input.addEventListener("input", calcularCargaTermica);
        tdInput.appendChild(input);

        const tdFator = document.createElement("td");
        tdFator.textContent = item.fator;
        tdFator.classList.add("fixed");

        const tdResultado = document.createElement("td");
        tdResultado.id = item.id + "_resultado";
        tdResultado.classList.add("output");
        tdResultado.textContent = "0.00";

        tr.appendChild(tdLabel);
        tr.appendChild(tdInput);
        tr.appendChild(tdFator);
        tr.appendChild(tdResultado);
        tableBody.appendChild(tr);
    }

    function calcularCargaTermica() {
        let total = 0;

        thermalData.forEach(item => {
            const input = document.getElementById(item.id);
            const value = parseFloat(input.value.replace(",", ".")) || 0;
            const carga = value * item.fator;
            total += carga;

            const resultadoTd = document.getElementById(item.id + "_resultado");
            resultadoTd.textContent = carga.toFixed(2);
        });

        document.getElementById("totalKcalh").textContent = total.toFixed(2) + " kcal/h";

        const tr = total / 3000;
        const btuh = tr * 12000;

        let trDisplay = document.getElementById("totalTR");

        if (!trDisplay) {
            const trContainer = document.createElement("div");
            trContainer.classList.add("results-section");

            const trTitle = document.createElement("h2");
            trTitle.textContent = "Equivalente em Toneladas de Refrigeração e BTU/h";
            trContainer.appendChild(trTitle);

            trDisplay = document.createElement("div");
            trDisplay.id = "totalTR";
            trDisplay.classList.add("result-value");
            trContainer.appendChild(trDisplay);

            container.appendChild(trContainer);
        }

        trDisplay.textContent = `${tr.toFixed(2)} TR  |  ${btuh.toFixed(2)} BTU/h`;
    }

    thermalData.forEach(createRow);
    calcularCargaTermica();
});
.logo-topo {
    text-align: center;
    margin-bottom: 20px;
}

.logo {
    max-width: 180px;
    height: auto;
}


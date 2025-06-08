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
        input.placeholder = "0";
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

        tr.appendChild(tdLabel);      // 1ª coluna: descrição
        tr.appendChild(tdInput);      // 2ª coluna: dado a ser inserido
        tr.appendChild(tdFator);      // 3ª coluna: fator fixo
        tr.appendChild(tdResultado);  // 4ª coluna: resultado

        tableBody.appendChild(tr);
    }

    function calcularCargaTermica() {
        let total = 0;

        thermalData.forEach(item => {
            const input = document.getElementById(item.id);
            const valor = parseFloat(input.value.replace(",", ".")) || 0;
            const carga = valor * item.fator;
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

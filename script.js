document.addEventListener("DOMContentLoaded", function () {
    const thermalData = [
        { label: "Área de paredes ao SOL", fator: 43, id: "dado1" },
        { label: "Área de paredes à sombra", fator: 18, id: "dado2" },
        { label: "Área de janela ou porta de vidro ao sol", fator: 520, id: "dado3" },
        { label: "Área de janela ou porta vidro ao sol com cortina", fator: 353, id: "dado4" },
        { label: "Área de janela ou porta de vidro à sombra", fator: 42, id: "dado5" },
        { label: "Área de cobertura", fator: 20, id: "dado6" },
        { label: "Área de piso entre andares", fator: 10, id: "dado7" },
        { label: "Número de pessoas", fator: 100, id: "dado8" },
        { label: "Potência dos equipamentos", fator: 1, id: "dado9" },
        { label: "Potência de iluminação", fator: 1, id: "dado10" },
        { label: "Vazão de ar de renovação (m³/h)", fator: 8.2, id: "dado11" }
    ];

    const tableBody = document.getElementById("thermalBody");

    function createRow(item) {
        const tr = document.createElement("tr");

        const tdLabel = document.createElement("td");
        tdLabel.textContent = item.label;

        const tdFator = document.createElement("td");
        tdFator.textContent = item.fator;
        tdFator.classList.add("fixed");

        const tdDado = document.createElement("td");
        const input = document.createElement("input");
        input.type = "number";
        input.id = item.id;
        input.value = 0;
        input.classList.add("input");
        input.addEventListener("input", calcularCargaTermica);
        tdDado.appendChild(input);

        const tdResultado = document.createElement("td");
        tdResultado.id = item.id + "_resultado";
        tdResultado.classList.add("output");
        tdResultado.textContent = "0.00";

        tr.appendChild(tdLabel);
        tr.appendChild(tdFator);
        tr.appendChild(tdDado);
        tr.appendChild(tdResultado);
        tableBody.appendChild(tr);
    }

    function calcularCargaTermica() {
        let total = 0;
        thermalData.forEach(item => {
            const input = document.getElementById(item.id);
            const value = parseFloat(input.value.replace(',', '.')) || 0;
            const carga = value * item.fator;
            total += carga;
            document.getElementById(item.id + "_resultado").textContent = carga.toFixed(2);
        });
        document.getElementById("totalKcalh").textContent = total.toFixed(2) + " kcal/h";
    }

    thermalData.forEach(createRow);
    calcularCargaTermica();
});

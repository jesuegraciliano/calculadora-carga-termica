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

    document.body.style.backgroundColor = "#1b5e20";

    const container = document.querySelector(".container");

    // Inserir logotipo IFSC
    const logo = document.createElement("img");
    logo.src = "./ifsc-logo.png";
    logo.alt = "Logotipo IFSC";
    logo.style.display = "block";
    logo.style.margin = "0 auto 20px auto";
    logo.style.maxHeight = "60px";
    container.insertBefore(logo, container.firstChild);

    const headerTitle = document.createElement("h1");
    headerTitle.textContent = "IFSC São José";
    headerTitle.style.textAlign = "center";
    headerTitle.style.marginBottom = "5px";
    container.insertBefore(headerTitle, logo.nextSibling);

    const subHeader = document.createElement("h2");
    subHeader.textContent = "Curso Técnico de Refrigeração";
    subHeader.style.textAlign = "center";
    subHeader.style.fontWeight = "normal";
    subHeader.style.marginTop = "0";
    subHeader.style.marginBottom = "20px";
    container.insertBefore(subHeader, headerTitle.nextSibling);

    const autor = document.createElement("p");
    autor.textContent = "Desenvolvido por Prof. Jesué Graciliano da Silva";
    autor.style.textAlign = "center";
    autor.style.fontStyle = "italic";
    autor.style.marginTop = "10px";
    container.appendChild(autor);

    const tableBody = document.getElementById("thermalBody");

    function createRow(item) {
        const tr = document.createElement("tr");

        const tdLabel = document.createElement("td");
        tdLabel.textContent = item.label;

        const tdDado = document.createElement("td");
        const input = document.createElement("input");
        input.type = "number";
        input.id = item.id;
        input.value = 0;
        input.classList.add("input");
        input.addEventListener("input", calcularCargaTermica);
        tdDado.appendChild(input);

        const tdFator = document.createElement("td");
        tdFator.textContent = item.fator;
        tdFator.classList.add("fixed");

        const tdResultado = document.createElement("td");
        tdResultado.id = item.id + "_resultado";
        tdResultado.classList.add("output");
        tdResultado.textContent = "0.00";

        tr.appendChild(tdLabel);
        tr.appendChild(tdDado);
        tr.appendChild(tdFator);
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

        const tr = total / 3000;
        let trDisplay = document.getElementById("totalTR");
        if (!trDisplay) {
            const trContainer = document.createElement("div");
            trContainer.classList.add("results-section");

            const trTitle = document.createElement("h2");
            trTitle.textContent = "Equivalente em Toneladas de Refrigeração";
            trContainer.appendChild(trTitle);

            trDisplay = document.createElement("div");
            trDisplay.id = "totalTR";
            trDisplay.classList.add("result-value");
            trContainer.appendChild(trDisplay);

            const exportButton = document.createElement("button");
            exportButton.textContent = "Gerar PDF do Relatório";
            exportButton.addEventListener("click", gerarPDF);
            trContainer.appendChild(exportButton);

            container.appendChild(trContainer);
        }
        trDisplay.textContent = tr.toFixed(2) + " TR";
    }

    function gerarPDF() {
        let texto = "Relatório de Carga Térmica\n\n";
        texto += "Item de Carga Térmica           | Dado Inserido | Fator Fixo | Carga Térmica (kcal/h)\n";
        texto += "--------------------------------------------------------------\n";
        thermalData.forEach(item => {
            const dado = document.getElementById(item.id).value;
            const carga = document.getElementById(item.id + "_resultado").textContent;
            const linha = `${item.label.padEnd(35)} | ${dado.padStart(13)} | ${String(item.fator).padStart(10)} | ${carga.padStart(20)}\n`;
            texto += linha;
        });

        texto += "\n\n";
        const total = document.getElementById("totalKcalh").textContent;
        const tr = document.getElementById("totalTR").textContent;
        texto += `TOTAL: ${total}  |  ${tr}\n\n`;

        const doc = new jsPDF();
        doc.setFontSize(12);
        doc.text(texto, 10, 10);
        doc.save("relatorio_carga_termica.pdf");
    }

    thermalData.forEach(createRow);
    calcularCargaTermica();

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => window.jsPDF = window.jspdf.jsPDF;
    document.body.appendChild(script);
});

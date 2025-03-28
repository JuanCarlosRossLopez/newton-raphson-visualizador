document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("nr-form").addEventListener("submit", (event) => {
        event.preventDefault();

        const funcion = document.getElementById("funcion").value;
        const derivada = document.getElementById("derivada").value;
        const x0 = parseFloat(document.getElementById("x0").value);

        try {
            const iterations = newtonRaphson(funcion, derivada, x0);
            displayResults(iterations);
            plotGraph(funcion, iterations);
        } catch (error) {
            document.getElementById("results").innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
        }
    });
});

function newtonRaphson(fString, fPrimeString, x0, maxIter = 100, tol = 1e-6) {
    const f = math.compile(fString); // Usar math.js
    const fPrime = math.compile(fPrimeString);

    let x = x0;
    let iterations = [];

    for (let i = 0; i < maxIter; i++) {
        const fx = f.evaluate({ x });
        const fPrimeX = fPrime.evaluate({ x });
        if (Math.abs(fx) < tol) break;

        if (fPrimeX === 0) {
            throw new Error("La derivada se anula, no se puede continuar.");
        }

        const xNext = x - fx / fPrimeX;
        iterations.push({ iter: i + 1, x, fx });
        x = xNext;
    }

    return iterations;
}

function displayResults(iterations) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    const table = document.createElement("table");
    table.className = "w-full border-collapse border border-gray-300";

    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `
        <th class="border border-gray-300 p-2">Iteración</th>
        <th class="border border-gray-300 p-2">x</th>
        <th class="border border-gray-300 p-2">f(x)</th>
    `;
    table.appendChild(headerRow);

    iterations.forEach(({ iter, x, fx }) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="border border-gray-300 p-2">${iter}</td>
            <td class="border border-gray-300 p-2">${x.toFixed(6)}</td>
            <td class="border border-gray-300 p-2">${fx.toFixed(6)}</td>
        `;
        table.appendChild(row);
    });

    resultsDiv.appendChild(table);
}

function plotGraph(funcion, iterations) {
    const f = math.compile(funcion);

    const xValues = [];
    const yValues = [];
    for (let i = -10; i <= 10; i += 0.1) {
        xValues.push(i);
        yValues.push(f.evaluate({ x: i }));
    }

    const iterX = iterations.map(({ x }) => x);
    const iterY = iterations.map(({ fx }) => fx);

    const ctx = document.getElementById("myChart").getContext("2d");
    new Chart(ctx, {
        type: "line",
        data: {
            labels: xValues,
            datasets: [
                {
                    label: "Función f(x)",
                    data: yValues,
                    borderColor: "rgba(54, 162, 235, 1)",
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1,
                },
                {
                    label: "Iteraciones (Newton-Raphson)",
                    data: iterY,
                    borderColor: "rgba(255, 99, 132, 1)",
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    pointRadius: 5,
                    pointBackgroundColor: "rgba(255, 99, 132, 1)",
                    fill: false,
                    showLine: false, // No conectar los puntos con líneas
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "top",
                },
                title: {
                    display: true,
                    text: "Gráfica de la Función y Newton-Raphson",
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "x",
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: "f(x)",
                    },
                },
            },
        },
    });
}
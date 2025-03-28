// Variables globales
let functionChart = null;
const ctx = document.getElementById("functionChart").getContext("2d");

// Event Listeners
document
  .getElementById("deriveBtn")
  .addEventListener("click", calculateDerivative);
document
  .getElementById("calculateBtn")
  .addEventListener("click", calculateRoot);

// Función para calcular la derivada
function calculateDerivative() {
  const funcStr = document.getElementById("func").value.trim();
  const derivativeInput = document.getElementById("derivative");

  if (!funcStr) {
    alert("Por favor, ingresa una función antes de derivar.");
    return;
  }

  try {
    const derivative = math.derivative(funcStr, "x");
    derivativeInput.value = derivative.toString();
  } catch (e) {
    alert(`Error al derivar: ${e.message}`);
    derivativeInput.value = "";
  }
}

// Función principal (Newton-Raphson)
function calculateRoot() {
  const funcStr = document.getElementById("func").value;
  const derivativeStr = document.getElementById("derivative").value;
  const initialGuess = parseFloat(
    document.getElementById("initialGuess").value
  );
  const tolerance = parseFloat(document.getElementById("tolerance").value);
  const resultDiv = document.getElementById("result");

  // Validaciones
  if (!funcStr || !derivativeStr || isNaN(initialGuess)) {
    resultDiv.innerHTML =
      '<span class="error">Completa todos los campos correctamente.</span>';
    return;
  }

  let f, df;
  try {
    f = math.compile(funcStr);
    df = math.compile(derivativeStr);
  } catch (e) {
    resultDiv.innerHTML = `<span class="error">Error en la expresión: ${e.message}</span>`;
    return;
  }

  // Algoritmo Newton-Raphson
  let x = initialGuess;
  let iterations = 0;
  let error = Infinity;
  let output = "Iteraciones:\n\n";
  const iterationPoints = [];

  while (error > tolerance && iterations < 100) {
    let fx, dfx;
    try {
      fx = f.evaluate({ x: x });
      dfx = df.evaluate({ x: x });
    } catch (e) {
      output += `<span class="error">Error al evaluar: ${e.message}</span>`;
      resultDiv.innerHTML = output;
      return;
    }

    if (Math.abs(dfx) < 1e-10) {
      output +=
        '<span class="error">Derivada cercana a cero. No converge.</span>';
      resultDiv.innerHTML = output;
      return;
    }

    const xNew = x - fx / dfx;
    error = Math.abs(xNew - x);
    output += `Iteración ${iterations}: x = ${x.toFixed(
      6
    )}, f(x) = ${fx.toFixed(6)}, Error = ${error.toFixed(6)}\n`;
    iterationPoints.push({ x: x, y: fx });
    x = xNew;
    iterations++;
  }

  // Resultado final
  resultDiv.innerHTML =
    iterations >= 100
      ? output +
        '\n<span class="error">No converge después de 100 iteraciones.</span>'
      : output +
        `\n<b>Raíz aproximada:</b> x ≈ ${x.toFixed(6)} (Error < ${tolerance})`;

  plotFunctionAndIterations(f, iterationPoints, initialGuess);
}

// Graficar función e iteraciones
function plotFunctionAndIterations(f, iterationPoints, x0) {
  const xMin = x0 - 3;
  const xMax = x0 + 3;
  const functionData = [];

  for (let x = xMin; x <= xMax; x += (xMax - xMin) / 100) {
    try {
      functionData.push({ x: x, y: f.evaluate({ x: x }) });
    } catch (e) {
      console.error(`Error al evaluar x=${x}:`, e);
    }
  }

  if (functionChart) functionChart.destroy();

  functionChart = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Función f(x)",
          data: functionData,
          borderColor: "rgb(75, 192, 192)",
          borderWidth: 2,
          pointRadius: 0,
          showLine: true,
        },
        {
          label: "Iteraciones",
          data: iterationPoints,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgb(255, 99, 132)",
          pointRadius: 5,
          showLine: true,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: { type: "linear", position: "bottom", title: { text: "x" } },
        y: { type: "linear", position: "left", title: { text: "f(x)" } },
      },
    },
  });
}

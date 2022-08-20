// CHARTS CONTEXT
const promediosCtx = document.getElementById("promedios").getContext("2d");
const estadoCtx = document.getElementById("estado").getContext("2d");
const promedioCtx = document.getElementById("promedio").getContext("2d");
const mesesCtx = document.getElementById("meses").getContext("2d");
const becaActualCtx = document.getElementById("becaActual").getContext("2d");
const desempeñoCtx = document.getElementById("desempeño").getContext("2d");

// PROMEDIOS EN TODAS LAS MATERIAS
const classesIDs = ["100", "200", "321", "466", "431", "455"];
const scores = [100, 90, 70, 50, 20, 30];

const promediosChart = new Chart(promediosCtx, {
  type: "bar",
  data: {
    labels: classesIDs,
    datasets: [
      {
        label: "Promedio",
        data: scores,
        backgroundColor: [
          "rgba(54, 162, 235, 0.8)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 0.5)",
        ],
        borderWidth: 4,
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
        text: "Promedios De Clases",
      },
    },
  },
});

// ESTADO DE LA BECA
const estados = [true, true, true, false, false, false];

const estadoChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: classesIDs,
    datasets: [
      {
        label: "Estado",
        data: estados,
        backgroundColor: ["rgba(54, 162, 235, 0.8)"],
        borderColor: ["rgba(54, 162, 235, 0.5)"],
        borderWidth: 4,
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
        text: "Estado de la Beca",
      },
    },
  },
});
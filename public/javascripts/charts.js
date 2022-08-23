// GET DATA
let perdidaGanada = document.getElementById("perdidaGanada").value;
perdidaGanada = perdidaGanada.split(",");
let allAvgsArr = document.getElementById("allAvgsArr").value;
allAvgsArr = allAvgsArr.split(",");
let quiz = document.getElementById("quiz").value;
quiz = quiz.split(",");
let exam = document.getElementById("exam").value;
exam = exam.split(",");
let homework = document.getElementById("homework").value;
homework = homework.split(",");

// CHARTS CONTEXT
const promediosCtx = document.getElementById("promedios").getContext("2d");
const estadoCtx = document.getElementById("estado").getContext("2d");
const mesesCtx = document.getElementById("meses").getContext("2d");
const desempeñoCtx = document.getElementById("desempeño").getContext("2d");

// DATA
const materias = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"];
const promedios = [100, 90, 70, 50, 20, 30];
const estadosDeBeca = allAvgsArr.map((avg) => {
  let cantidadBecaAct = 0;

  if (avg < 70) cantidadBecaAct = 0;
  else if (avg <= 79) cantidadBecaAct = 10;
  else if (avg <= 89) cantidadBecaAct = 20;
  else if (avg <= 99) cantidadBecaAct = 30;
  else cantidadBecaAct = 40;

  return cantidadBecaAct;
});
const conBecaSinBeca = ["Con Beca", "Sin Beca"];
const conBecaSinBecaValues = [perdidaGanada.filter((el) => el == "Ganada").length, perdidaGanada.filter((el) => el == "Perdida").length];
const evaluaciones = ["Exámen", "Quiz", "Tareas"]; 
const evaluacionesValues = [91, 95, 89];

// PROMEDIOS EN TODAS LAS MATERIAS
const promediosChart = new Chart(promediosCtx, {
  type: "bar",
  data: {
    labels: materias,
    datasets: [
      {
        label: "Promedio",
        data: allAvgsArr,
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
        text: "Promedios (Clases)",
      },
    },
  },
});

// ESTADO DE LA BECA
const estadoChart = new Chart(estadoCtx, {
  type: "bar",
  data: {
    labels: materias,
    datasets: [
      {
        label: "Estado",
        data: estadosDeBeca,
        backgroundColor: ["rgba(54, 162, 100, 0.8)"],
        borderColor: ["rgba(54, 162, 100, 0.5)"],
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
        text: "Estado de la beca (%)",
      },
    },
  },
});

// CANTIDAD DE MESES CON BECA O SIN ELLA
const mesesChart = new Chart(mesesCtx, {
  type: "doughnut",
  data: {
    labels: conBecaSinBeca,
    datasets: [
      {
        label: "Estado",
        data: conBecaSinBecaValues,
        backgroundColor: ["rgba(54, 10,40, 0.5)", "rgba(54, 20, 100, 0.5)"],
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
        text: "Estado de la beca (Meses)",
      },
    },
  },
});

// DESEMPEÑO DE TAREAS, QUIZZES, EXÁMENES
const desempeñoChart = new Chart(desempeñoCtx, {
  type: "bar",
  data: {
    labels: materias,
    datasets: [
      {
        label: "Exámen", 
        data: exam,
        backgroundColor: ["rgba(54, 240, 235, 0.8)"],
        borderColor: ["rgba(54, 240, 235, 0.5)"],
        borderWidth: 4,
      },
      {
        label: "Quiz",
        data: quiz,
        backgroundColor: ["rgba(54, 1, 235, 0.8)"],
        borderColor: ["rgba(54, 1, 235, 0.5)"],
        borderWidth: 4,
      },
      {
        label: "Tareas", 
        data: homework,
        backgroundColor: ["rgba(54, 240, 1, 0.8)"],
        borderColor: ["rgba(54, 240, 1, 0.5)"],
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
        text: "Desempeño en clase",
      },
    },
  },
});
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
// var ObjectId = require('mongodb').ObjectId

const dbName = "practica_analisis_1";
const collName = "CALIS";
const collName2 = "CUENTAS";
const url = "mongodb://localhost:27017";

const client = new MongoClient(url);

// MÉTODOS DE CONEXIONES -----------------------------------------------------------------------------
// CONEXION A DB CALIFICACIONES
const connectToCalis = async (coleccion) => {
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(coleccion);

  console.log("Connected To Mongo");

  return {
    collection,
    db
  };
};

// CONEXION A DB CUENTAS DE ALUMNOS
const connectToCuentas = async (coleccion) => {
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(coleccion);

  console.log("Connected To Mongo");

  return {
    collection,
    db
  };
};

// MÉTODOS PARA ACTUALIZACIÓN DE DATOS PREVIO A USO -----------------------------------------------------
// AGREGA CAMPOS DE FECHAS/MESES Y PROMEDIOS DE CLASE EN MÚLTIPLES DOCUMENTOS (INICIAL)
const initDatesAvgs = async () => {
  const { collection } = await connectToCalis(collName)

  for (let a = 2999; a < 3999; a++) {
    // Encontrar todos los docs de un alumno y convertirlo a un arreglo
    let res = await collection.find({ student_id: a }).toArray()

    let classes = []
    let avgArr = []
    let avg = 0;

    // Entrar a cada doc del alumno seleccionado
    for (let i = 0; i < res.length; i++) {
      /* Entrar a las calificaciones en ese documento y sumarlas
        para luego hacer un promedio y agregarlos a un arreglo */
      for (let j = 0; j < res[i].scores.length; j++) {
        avg += res[i].scores[j].score
      }

      avg /= res[i].scores.length
      avg = Math.round(avg)
      avgArr.push(avg)

      // Agregar los números de las clases a otro arreglo
      classes.push(res[i].class_id)
    }

    // Actualizar documentos con los nuevos 
    let cantidadClases = classes.length
    for (let x = 0; x < cantidadClases; x++) {
      await collection.findOneAndUpdate({ class_id: classes[x], student_id: a }, { $set: { month: x + 1, average: avgArr[x] } })

      // Cuando llegue al mes número 12, en el siguiente ciclo el iterador regresa a 0
      if (x == 11) {
        cantidadClases -= 12
        x = -1
      }
    }
  }

  console.log("Completado")
}

// MÉTODOS PARA ESTUDIANTES --------------------------------------------------------------------------
// OBTENER ESTUDIANTE
const getStudent = async (student_id) => {
  let student = Number(student_id)

  const { collection } = await connectToCalis(collName);

  let res = await collection.find({ student_id: student }).toArray();

  return res;
};

// FIXME: INFO YA PUEDE OBTENERSE DE becaData
// OBTENER PROMEDIO GENERAL
// const avgGeneral = async (student_id) => {
//   // Obtiene todos los documentos de un estudiante en forma de arreglo
//   let res = getStudent(student_id);

//   /* Agregar a una variable todos los promedios para sumarlos
//     y hacer promedio general */
//   let avgGeneral = 0
//   for (const data of res) {
//     avgGeneral += data.average
//   }

//   avgGeneral /= res.length
//   avgGeneral = Math.round(avgGeneral)

//   // Regresar promedio general
//   return avgGeneral
// }

// FIXME: INFO YA PUEDE OBTENERSE DE becaData
// CHECAR SI ESTUDIANTE TIENE BECA Y CUÁNTO PROMEDIO GENERAL TIENE
// const checaBeca = async (student_id) => {
//   let avg = 0;
//   const res = await getStudent(student_id);

//   for (const data of res) {
//     avg += data.average;
//   }

//   avg /= res.length;
//   avg = Math.round(avg)

//   if (avg < 70) {
//     return {
//       res: "Sin Beca",
//       average: avg
//     }
//   } else {
//     return {
//       res: "Becado",
//       average: avg
//     }
//   }
// }

// CHECAR DATOS GENERALES DE BECA COMO PROMEDIO ACTUAL, RACHA DE MESES MÁS LARGA DONDE
// MANTUVO BECA, CANTIDAD ACUAL DE BECA, Y EL CUÁNDO GANÓ BECA Y CUÁNDO LA PERDIÓ
const becaData = async (student_id) => {
  let avg = 0;
  let allAvgsArr = [];
  let tempSumaAvgs = 0;
  let tempAvg = 0;
  let perdidaGanada = [];
  let tempRacha = 0;
  let racha = 0;
  let cantidadBecaAct = 0;
  let resBecado = "";
  let allDesempeño = [];
  
  // Obtener todos los documentos del estudiante en cuestón
  const res = await getStudent(student_id);

  // Iterar a través del arreglo obtenido
  for (const data of res) {
    // SACAR PROMEDIO DE TAREAS Y PASAR QUIZ Y EXAMEN AL ARRAY allDesempeño
    let tareas = Array.from(data.scores);
    tareas.shift();
    tareas.shift();
    let tareasAvg = 0;
    for (const data of tareas) {
      tareasAvg += data.score;
    }
    tareasAvg /= 2;

    let desempeño = Array.from(data.scores);
    desempeño.pop();
    desempeño.pop();
    desempeño.push({ type: "homework", score: tareasAvg });

    allDesempeño.push(desempeño);

    // Sumar todos los promedios y hacer un promedio general de eso después del ciclo
    avg += data.average;
    allAvgsArr.push(data.average);
  }

  allDesempeño = allDesempeño.flat(1);
  const homework = allDesempeño
    .filter((el) => el.type == "homework")
    .map((el) => el.score);
  const quiz = allDesempeño
    .filter((el) => el.type == "quiz")
    .map((el) => el.score);
  const exam = allDesempeño
    .filter((el) => el.type == "exam")
    .map((el) => el.score);

  avg /= res.length;
  avg = Math.round(avg);

  console.log(avg)

  // Checar cuál es el promedio entre clases (calculada por acumulación) para ver si ahí ganó o perdió la beca
  for (let j = 1; j < allAvgsArr.length + 1; j++) {
    tempSumaAvgs += allAvgsArr[j - 1]
    tempAvg = tempSumaAvgs / j
    if (tempAvg > 69) {
      perdidaGanada.push("Ganada")
    } else {
      perdidaGanada.push("Perdida")
    }
  }

  /* Calcula la racha más larga de meses en los que mantuvo beca en base
    al arreglo perdidaGanada */
  for (let i = 0; i < perdidaGanada.length; i++) {
    if (perdidaGanada[i] === "Ganada") {
      tempRacha++
    } else {
      if (tempRacha > racha) {
        racha = tempRacha
      }
      tempRacha = 0
    }
  }

  // Calcula la cantidad de beca actual
  if (avg < 70)
    cantidadBecaAct = 0;
  else if (avg <= 79)
    cantidadBecaAct = 10;
  else if (avg <= 89)
    cantidadBecaAct = 20;
  else if (avg <= 99)
    cantidadBecaAct = 30;
  else
    cantidadBecaAct = 40;

  // Checa si el estudiante anda becado o no
  if (cantidadBecaAct != 0) {
    resBecado = "Con Beca!"
  } else {
    resBecado = "Sin Beca!"
  }

  let obj = { avg, racha, perdidaGanada, cantidadBecaAct, resBecado, allAvgsArr, homework, quiz, exam }
  return obj
}

// FIXME: ESTO YA ES EN CASO DE QUE SE AGREGUE OTRA CLASE AL ALUMNO
// CALCULAR EL PROMEDIO DE UNA CLASE NUEVA
const calculateAverage = async (student_id, class_id) => {
  const { collection } = await connectToCalis(collName);

  const res = await collection.findOne({
    student_id,
    class_id,
  });

  const scoresArr = res.scores;

  let sumScores = 0;

  for (const scoreObj of scoresArr) {
    sumScores += scoreObj.score;
  }

  const average = sumScores / scoresArr.length;

  return average;
};

// FIXME: JUNTAR MÉTODO CON OTROS PARA MODIFICAR TODOS LOS ATRIBUTOS; PARA DESPUÉS
// AGREGAR CAMPO DE PROMEDIOS (ESTO ES PARA UN DOC A LA VEZ)
// EJEMPLO -> await setAverage(0, 339);
// const setClassData = async (student_id, class_id) => {
//   const average = await calculateAverage(student_id, class_id);

//   const { collection } = await connectToCalis(collName);

//   await collection.insertOne({ student_id, class_id, average});
// };

// FIXME: ESTO ES PARA UN DOC A LA VEZ; SE PUEDE OBTENER DE becaData
// SACAR EL PROCENTAJE DE BECA
// const getPercentageBeca = async (student_id, class_id) => {
//   const average = await calculateAverage(student_id, class_id);

//   if (average < 70) return 0;

//   if (average <= 79)
//     return 10;
//   else if (average <= 89)
//     return 20;
//   else if (average <= 99)
//     return 30;
//   else
//     return 40;
// };

// FIXME: ESTO ES PARA UN ESTUDIANTE A LA VEZ; YA SE PUEDE OBTENER DE becaData
// SACAR PROMEDIO GENERAL
// const obtenerPromedioGeneral = async (student_id) => {
//   const student = await getStudent(student_id);

//   let sumAverage = 0;

//   for (const data of student) {
//     sumAverage += data.average;
//   }

//   const average = sumAverage / student.length;

//   return average;
// }

// MÉTODOS PARA EL ADMIN ---------------------------------------------------------------------------------
// CHECAR SI UN USUARIO EXISTE
const checkUserExistence = async (user) => {
  const { collection } = await connectToCuentas(collName2);
  let res = await collection.findOne({ student: user });

  if (!res) throw "ERROR: Usuario no existe"
  else{
    const obj = { res, collection };
    return obj
  }
}

// DAR DE ALTA USUARIOS
const newStudent = async (user) => {
  const { collection } = await connectToCuentas(collName2);
  let res = await collection.findOne({ student: user.student_id });

  if (!res) {
    var hashpass = await bcrypt.hash(user.pass, 10);
    await collection.insertOne({ student: user.student_id, password: hashpass, type: "student", state: "activo" });
  
    let res2 = await collection.findOne({ student: user.student_id });
    return res2;
  }
  
  throw "ERROR: Usuario ya existe"
}

// CAMBIAR CONTRASEÑA DE USUARIOS
const changePass = async (user) => {
  checkUserExistence(user.student_id)
    .then(async ({ res, collection }) => {
      if (user.newPass !== user.confPass) throw "ERROR: Los campos de contraseña no coinciden"

      let resComparar = await bcrypt.compare(user.newPass, res.password)
      if (resComparar) throw "ERROR: La nueva contraseña y la actual son iguales"

      var hashpass = await bcrypt.hash(user.newPass, 10);
      await collection.findOneAndUpdate({ student: res.student }, { $set: { password: hashpass } });
    })
    .catch((err) => {
      throw err
    })
}

// DESACTIVAR USUARIOS
const deactivateStudent = async (user) => {
  await checkUserExistence(user)
    .then(async ({ res, collection }) => {
      if(res.state == "inactivo") throw "Usuario ya desactivado"
      await collection.findOneAndUpdate({ student: res.student }, { $set: { state: "inactivo" } });
    })
    .catch((err) => {
      throw err;
    })
}

module.exports = {
  client,
  url,
  dbName,
  collName,
  collName2,
  connectToCalis,
  connectToCuentas,
  initDatesAvgs,
  becaData,
  calculateAverage,
  checkUserExistence,
  newStudent,
  changePass,
  deactivateStudent,
};

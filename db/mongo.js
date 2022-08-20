const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
// var ObjectId = require('mongodb').ObjectId

const dbName = "practica_analisis_1";
const collName = "CALIS";
const collName2 = "CUENTAS";
const url = "mongodb://localhost:27017";

const client = new MongoClient(url);

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

// PONER FECHAS/MESES EN LOS DOCUMENTOS (INICIAL)
const placeInitDates = async () => {
  const { collection } = await connectToCalis(collName)

  for (let a = 2298; a < 2599; a++) {
    let res = await collection.find({ student_id: a }).toArray()
    let classes = []
    for (let i = 0; i < 10; i++) {
      classes.push(res[i].class_id)
    }

    for (let x = 0; x < classes.length; x++) {
      await collection.findOneAndUpdate({ class_id: classes[x], student_id: a }, { $set: { month: x + 1 } })
    }
  }

  console.log("Completado")
}

// OBTENER ESTUDIANTE
const getStudent = async (student_id) => {
  const { collection } = await connectToCalis(collName);

  let res = await collection.find({ student_id }).toArray();

  return res;
};

// CALCULAR EL PROMEDIO DE UNA CLASE
const calculateAverage = async (student_id, class_id) => {
  const { collection } = await connectToCalis(collName);

  const res = await collection.findOne({
    student_id,
    class_id,
  });

  const scores = res.scores;

  let sumScores = 0;

  for (const score of scores) {
    sumScores += score.score;
  }

  const average = sumScores / scores.length;

  return average;
};

// AGREGAR CAMPO DE PROMEDIOS
// EJEMPLO -> await setAverage(0, 339);
const setAverage = async (student_id, class_id) => {
  const average = await calculateAverage(student_id, class_id);

  const { collection } = await connectToCalis(collName);

  await collection.updateOne({ student_id, class_id }, { $set: { average } });
};

// FIXME:
// SACAR EL PROCENTAJE DE BECA
const getPercentageBeca = async (studentID, classID) => {
  const average = await calculateAverage(studentID, classID);

  if (average < 70) return 0;

  if (average <= 79)
    return 10;
  else if (average <= 89)
    return 20;
  else if (average <= 99)
    return 30;
  else
    return 40;
};

// FIXME:
// SACAR PROMEDIO GENERAL
const obtenerPromedioGeneral = async (studentID) => {
  const student = await getStudent(studentID);

  let sumAverage = 0;

  for (const data of student) {
    sumAverage += data.average;
  }

  const average = sumAverage / student.length;

  return average;
}

// CHECAR SI ESTUDIANTE TIENE BECA Y CUÁNTO PROMEDIO GENERAL TIENE
const checaBeca = async (studentID) => {
  const res = await getStudent(studentID);

  let avg = 0;
  for (let i = 0; i < res.length; i++) {
    avg += res[i].average;
  }

  avg /= 10;
  avg = Math.round(avg)

  if (avg < 70) {
    return {
      res: "Sin Beca",
      average: avg
    }
  } else {
    return {
      res: "Becado",
      average: avg
    }
  }
}

// DAR DE ALTA USUARIOS
const newStudent = async (user) => {
  checkUserExistence(user)
    .then(() => {
      return { error: "Ya existe el alumno" };
    })
    .catch(async () => {
      var hashpass = await bcrypt.hash(user.pass, 10);
      await collection.insertOne({ student: user.student_id, password: hashpass, type: "student", state: "activo" });
      let res2 = await collection.findOne({ student_id: user.student });
      return { student: res2 };
    })
}

// CAMBIAR CONTRASEÑA DE USUARIOS
const changePass = async (user) => {
  checkUserExistence(user)
    .then(async (res) => {
      if (user.newPass !== user.confPass) throw "ERROR: Los campos de contraseña no coinciden"

      let resComparar = await bcrypt.compare(user.newPass, res.password)
      if (resComparar) throw "ERROR: La nueva contraseña y la actual son iguales"

      var hashpass = await bcrypt.hash(user.pass, 10);
      await collection.findOneAndUpdate({ student_id: res.student_id }, { $set: { password: hashpass } });
    })
    .catch((err) => {
      throw err
    })
}

// DESACTIVAR USUARIOS
const deactivateStudent = async (user) => {
  checkUserExistence(user)
    .then(async (res) => {
      await collection.findOneAndUpdate({ student_id: res.student_id }, { $set: { state: "inactivo" } });
    })
    .catch((err) => {
      throw err;
    })
}

// CHECAR SI UN USUARIO EXISTE
const checkUserExistence = async (user) => {
  const { collection } = await connectToCuentas(collName2);
  let res = await collection.findOne({ student_id: user.student_id });

  if (!res) throw "ERROR: Usuario no existe"
  else return res;
}

// const insertUser = async (user) => {
//   const { collection } = await connectToMongo();

//   const res = await collection.findOne({
//     email: user.email
//   });

//   // EN CASO DE QUE EL CORREO YA EXISTA, MANDAR ERROR
//   if (res) {
//     client.close();
//     throw false
//   }

//   await collection.insertOne(user);

//   const res2 = await collection.findOne({
//     email: user.email
//   });

//   client.close();

//   return res2
// };

// // ACTUALIZAR DE SER USUARIO "PENDIENTE" A UNO "ACTIVO"
// const updateUserState = async (id) => {
//   await client.connect();
//   const db = client.db(dbName);
//   const collection = db.collection(collName);

//   let response = await collection.findOneAndUpdate({ _id: ObjectId(id) }, { $set: { estado: "activo" } }, { new: true })

//   if (!response) {
//     throw false
//   }
//   return response
// }

// // ACTUALIZAR CONTRASEÑA EN CASO DE OLVIDO
// const updateUserPass = async (id, contraNueva) => {
//   await client.connect();
//   const db = client.db(dbName);
//   const collection = db.collection(collName);

//   let response = await collection.findOneAndUpdate({ _id: ObjectId(id) }, { $set: { contrasena: contraNueva } }, { new: true })

//   if (!response) {
//     throw false
//   }
//   return response
// }

// // ACTUALIZAR INFO DEL USUARIO EN PANTALLA DE AJUSTES
// const updateUserInfo = async (user) => {
//   const { collection } = await connectToMongo();

//   if (!user.contrasena) {
//     await collection.updateOne({ email: user.email },
//       {
//         $set:
//         {
//           nombres: user.nombres,
//           apellidos: user.apellidos
//         }
//       }
//     )

//     var usuarioDB1 = await collection.findOne({ email: user.email })
//     return usuarioDB1

//   } else {
//     if (user.contrasena && !user.confirmacion) {
//       throw false
//     }

//     var usuarioDB2 = await collection.findOne({ email: user.email })
//     var respuesta = await bcrypt.compare(user.contrasena, usuarioDB2.contrasena);

//     if (respuesta) {
//       console.log('contraseña similar a la antigua')
//       throw false
//     } else {
//       var hashpass = await bcrypt.hash(user.contrasena, 10);
//       await collection.updateOne({ email: user.email },
//         {
//           $set:
//           {
//             nombres: user.nombres,
//             apellidos: user.apellidos,
//             contrasena: hashpass
//           }
//         }
//       )

//       var usuarioDB3 = await collection.findOne({ email: user.email })
//       return usuarioDB3
//     }
//   }
// }

// // PAGAR PRODUCTOS
// const insertPayment = async (payment) => {
//   await client.connect();
//   const db = client.db(dbName);
//   const collection = db.collection("payments");

//   await collection.insertOne(payment);

//   client.close();
// };

// // BUSCAR USUARIOS
// const searchUser = async (email) => {
//   await client.connect();
//   const db = client.db(dbName);
//   const collection = db.collection("users");

//   let response = await collection.findOne({ email: email })

//   console.log(response)
//   console.log(email)

//   if (!response) {
//     throw false
//   }
//   return response
// }

// const searchUser2 = async (id) => {
//   await client.connect();
//   const db = client.db(dbName);
//   const collection = db.collection("users");

//   let response = await collection.findOne({ _id: ObjectId(id) })

//   if (!response) {
//     throw false
//   }
//   return response
// }

// // DESACTIVAR USUARIOS
// const deleteAccount = async (user) => {
//   const { collection } = await connectToMongo();
//   await collection.updateOne(
//     {
//       email: user.email,
//     },
//     {
//       $set: {
//         estado: "inactivo",
//       },
//     }
//   );
// };

module.exports = {
  client,
  url,
  dbName,
  collName,
  connectToCalis,
  connectToCuentas,
  placeInitDates,
  checaBeca,
  calculateAverage,
  setAverage,
  newStudent,
  deactivateStudent,
  changePass,
  checkUserExistence
};

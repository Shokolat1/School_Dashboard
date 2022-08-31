var express = require("express");
var router = express.Router();
const { newStudent, deactivateStudent, client, changePass } = require("../db/mongo");

// Checar si el usuario está autenticado con usuario y contraseña
const isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/");
  }
};

// RUTAS GET -----------------------------------------------------------
/* PÁGINA INICIAL ADMIN */
router.get("/", isAuth, function (req, res, next) {
  if (req.user.type == "student")
    res.redirect(`/dashboard?user=${req.user.student}`);
  else res.render("newUser", { title: "Dar de Alta - ADMIN" });
});

router.get("/editPass", isAuth, function (req, res, next) {
  if (req.user.type == "student")
    res.redirect(`/dashboard?user=${req.user.student}`)
  else res.render("editPass", { title: "Editar Contraseña - ADMIN" })
});

// VISTA DESACTIVAR USUARIOS
router.get("/deactivate", isAuth, function (req, res, next) {
  if (req.user.type == "student")
    res.redirect(`/dashboard?user=${req.user.student}`)
  else res.render("desactivar", { title: "Desactivar Cuenta - ADMIN" })
});

// MÉTODO DESACTIVAR USUARIOS
router.get("/delete", async function (req, res) {
    await deactivateStudent(req.query.user)
      .then(() => {
        console.log("Usuario Desactivado")
        res.redirect("/users/deactivate?deac=1");
      })
      .catch((err) => {
        res.redirect(`/users/deactivate?deac=2&err=${err}`);
      })
      .finally(() => {
        client.close();
      });
  // }
});

// RUTAS POST -----------------------------------------------------------

// DAR DE ALTA A UN USUARIO
router.post("/alta", async function (req, res) {
  if (req.body.student_id == "" || req.body.pass == "") {
    res.redirect("/users?newUs=1");
  } else {
    await newStudent(req.body)
      .then((result) => {
        console.log(result)
        res.redirect("/users?newUs=2");
      })
      .catch((err) => {
        console.log(err)
        res.redirect(`/users?newUs=3&err=${err}`);
      })
      .finally(() => {
        client.close();
      })
  }
});

// EDITAR CONTRASEÑA DE USUARIO
router.post("/editPass", async function (req, res) {
  if (req.body.student_id == "" || req.body.pass == "") {
    res.redirect("/users/editPass?edP=1");
  } else {
    await changePass(req.body)
      .then(() => {
        res.redirect("/users/editPass?edP=2");
      })
      .catch((err) => {
        console.log(err)
        res.redirect(`/users/editPass?edP=3&err=${err}`);
      })
      .finally(()=>{
        client.close();
      })
  }
});

module.exports = router;

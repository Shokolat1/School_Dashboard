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

router.get("/deactivate", isAuth, function (req, res, next) {
  if (req.user.type == "student")
    res.redirect(`/dashboard?user=${req.user.student}`)
  else res.render("desactivar", { title: "Desactiar Cuenta - ADMIN" })
});

// RUTAS POST -----------------------------------------------------------

// DAR DE ALTA A UN USUARIO
router.post("/alta", async function (req, res) {
  await newStudent(req.body)
    .then((result) => {
      console.log(result)
    })
    .catch((err) => {
      console.log(err)
    })
    .finally(() => {
      res.redirect("/users");
      client.close();
    })
});

// EDITAR CONTRASEÑA DE USUARIO
router.post("/editPass", async function (req, res) {
  await changePass(req.body)
    .then(() => {
      console.log("Contraseña Cambiada")
      client.close();
    })
    .catch((err) => {
      console.log(err)
    })
    .finally(() => {
      res.redirect("/users");
    })

});

// DESACTIVAR USUARIOS
router.post("/desactivar", async function (req, res) {
  await deactivateStudent(req.body.student_id)
    .then(() => {
      console.log("Usuario Desactivado")
    })
    .catch((err) => {
      console.log(err)
    })
    .finally(() => {
      client.close();
      res.redirect("/users");
    });
});

module.exports = router;

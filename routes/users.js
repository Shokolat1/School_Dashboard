var express = require("express");
var router = express.Router();

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

router.get("/editPass", isAuth, function(req, res, next) {
  if(req.user.type == "student")
    res.redirect(`/dashboard?user=${req.user.student}`)
  else res.render("editPass", { title: "Editar Contraseña - ADMIN" })
});

router.get("/deactivate", isAuth, function(req, res, next) {
  if(req.user.type == "student")
    res.redirect(`/dashboard?user=${req.user.student}`)
  else res.render("desactivar", { title: "Desactiar Cuenta - ADMIN" })
});

// RUTAS POST -----------------------------------------------------------

module.exports = router;

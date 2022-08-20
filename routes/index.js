var express = require('express');
var router = express.Router();
const { placeInitDates, checkUserExistence, client } = require("../db/mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");

// RUTAS GET -----------------------------------------------------------
// Página Login
router.get('/', async function (req, res, next) {
  res.render('index', { title: "Dashboard Escolar" });
});

router.get('/logout', async function (req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
  // res.render('index', { title: "Dashboard Escolar" });
})

// RUTAS POST ----------------------------------------------------------
// INICIAR SESIÓN
router.post('/login', async function (req, res, next) {
  passport.authenticate("local", { failureRedirect: "/" }),
    function (req, res) {
      res.redirect("/charts");
    }
})

// MÉTODOS EXTRA --------------------------------------------------------
// ESTRATEGIA LOCAL
passport.use(new LocalStrategy({
  usernameField: "studentID",
  passwordField: "studentPass",
},
  async function (username, password, done) {
    checkUserExistence(username)
      .then(async (res) => {
        const match = await bcrypt.compare(password, res.password);

        // CHECAR SI LA CONTRASEÑA EN EL FORMULARIO Y LA DB SON LAS MISMAS
        if (!match || res.state && res.state !== 'activo') {
          return done(null, false);
        }

        return done(null, result);
      })
      .catch(() => {
        return done(null, false);
      })
      .finally(() => {
        client.close()
      })
  }
));

// FIXME:
// SERIALIZAR AL USUARIO
passport.serializeUser(function(user, done) {
  done(null, user.student);
});

module.exports = router;

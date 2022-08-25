var express = require('express');
var router = express.Router();
const { initDatesAvgs, checkUserExistence, client, becaData, connectToCuentas, collName2, newStudent } = require("../db/mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");

// MÉTODOS EXTRA --------------------------------------------------------
// ESTRATEGIA LOCAL
passport.use(new LocalStrategy({
  usernameField: "userID",
  passwordField: "userPass",
},
  async function (username, password, done) {
    checkUserExistence(username)
      .then(async (obj) => {
        const match = await bcrypt.compare(password, obj.res.password);

        // CHECAR SI LA CONTRASEÑA EN EL FORMULARIO Y LA DB SON LAS MISMAS,
        // Y SI EL USUARIO ESTÁ ACTIVO
        if (match && obj.res.state == 'activo') {
          return done(null, obj.res);
        }

        return done(null, false);
      })
      .catch(() => {
        return done(null, false);
      })
      .finally(() => {
        client.close()
      })
  }
));

// SERIALIZAR AL USUARIO
passport.serializeUser(function (user, done) {
  done(null, user.student);
});

// DESERIALIZAR EL USUARIO
passport.deserializeUser(async function (id, done) {
  await connectToCuentas(collName2)
    .then(({ collection }) => {
      collection.findOne({ student: id }, function (err, user) {
        done(err, user);
      });
    })
});

// Checar si el usuario está autenticado con usuario y contraseña
const isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/");
  }
};

// RUTAS GET -----------------------------------------------------------
// Página Login
router.get('/', async function (req, res, next) {
  // await newStudent(req.body)
  // await newStudent(student)
  //   .then((response) => {
  //     console.log(`Usuario agregado: ${response.student}`)
  res.render('index', { title: "Dashboard Escolar" });
  // })
  // .catch((err) => {
  //   console.log(err)
  //   // res.redirect("/")
  // })
  // .finally(() => {
  //   client.close()
  // })
});

// Ver el dashboard
router.get('/dashboard', isAuth, async function (req, res, next) {
  if (req.user.type === "admin") res.redirect("/users")
  else {
    await becaData(req.query.user)
      .then((obj) => {
        // console.log(obj)

        // SE MANDA AL CLIENTE LA INFORMACION DEL ESTUDIANTE PARA QUE SE MUESTRE EN LA DASHBOARD
        res.render('charts', {
          title: "Dashboard Escolar",
          cantidadBecaAct: obj.cantidadBecaAct,
          avg: obj.avg,
          perdidaGanada: obj.perdidaGanada,
          racha: obj.racha,
          resBecado: obj.resBecado,
          allAvgsArr: obj.allAvgsArr,
          homework: obj.homework, 
          quiz: obj.quiz, 
          exam: obj.exam
        });
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
        client.close()
      })
  }
});

// Cerrar Sesión
router.get('/logout', async function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect("/");
  });
})

// RUTAS POST ----------------------------------------------------------
// INICIAR SESIÓN
router.post("/login",
  passport.authenticate("local", { failureRedirect: "/" }),
  function (req, res) {
    if (req.user.type === "admin") {
      res.redirect("/users");
    } else {
      res.redirect(`/dashboard?user=${req.user.student}`);
    }
  }
)
 
module.exports = router;

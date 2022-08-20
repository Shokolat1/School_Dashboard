var express = require('express');
var router = express.Router();

// RUTAS GET -----------------------------------------------------------
/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

// Ver el dashboard
router.get('/charts', async function(req, res, next) {
  res.render('charts', { title: "Dashboard Escolar" });
});

// RUTAS POST -----------------------------------------------------------

module.exports = router;

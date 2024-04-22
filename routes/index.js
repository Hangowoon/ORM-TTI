var express = require('express');
var router = express.Router();

/* home page.
- 호출주소체계 : http://localhost:3000
*/
router.get('/', async (req, res, next) => {
  res.render('tti/home.ejs', { title: 'Express' });
});

/* main page.
- 호출주소체계 : http://localhost:3000/main
*/
router.get('/main', async (req, res, next) => {
  res.render('tti/main.ejs', { title: 'Express' });
});

module.exports = router;

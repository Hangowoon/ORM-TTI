var express = require('express');
var router = express.Router();

/* login page
- 호출주소체계 : http://localhost:3000/login
*/
router.get('/', async (req, res, next) => {
  res.render('tti/login.ejs', { title: 'Express' });
});

router.post('/', async (req, res, next) => {
  res.redirect('/main', { title: 'Express' });
});

module.exports = router;

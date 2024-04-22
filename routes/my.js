var express = require('express');
var router = express.Router();

/* my page.
- 호출주소체계 : http://localhost:3000/my
*/
router.get('/', async (req, res, next) => {
  res.render('tti/my.ejs', { title: 'Express' });
});

module.exports = router;

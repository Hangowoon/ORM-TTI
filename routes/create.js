var express = require('express');
var router = express.Router();

/* create page.
- 호출주소체계 : http://localhost:3000/create
*/
router.get('/', async (req, res, next) => {
  res.render('tti/create.ejs', { title: 'Create' });
});

module.exports = router;

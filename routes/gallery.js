var express = require('express');
var router = express.Router();

/* gallery page.
- 호출주소체계 : http://localhost:3000/gallery
*/
router.get('/', async (req, res, next) => {
  res.render('tti/gallery.ejs', { title: 'Express' });
});

module.exports = router;

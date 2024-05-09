var express = require('express');
var router = express.Router();

//db 연결
var db = require('../models/index.js');

// 세션 미들웨어 참조
const { isLoggedIn, isNotLoggedIn } = require('./sessionMiddleware');

/* home page.
- 호출주소체계 : http://localhost:3000
*/
router.get('/', async (req, res, next) => {
  // 공개된 이미지만 갤러리 리스트에 보여줌
  var disclosuerImages = await db.Generated_data.findAll({
    //비공개:0, 공개:1
    where: { data_disclosure: 1 },
  });

  res.render('tti/home.ejs', { disclosuerImages });
});

/* main page.
- 호출주소체계 : http://localhost:3000/main
*/
router.get('/main', isLoggedIn, async (req, res, next) => {
  // 로그인 인증여부 체크 후 미인증시 로그인페이지로 이동
  // if (req.session.isLogined == undefined) {
  //   res.redirect('/login');
  // }

  //로그인한 사용자 세션 정보 추출
  var isLogined = req.session.isLogined;
  var loginUserData = req.session.loginUser;

  // 공개된 이미지만 갤러리 리스트에 보여줌
  var disclosuerImages = await db.Generated_data.findAll({
    //비공개:0, 공개:1
    where: { data_disclosure: 1 },
  });

  res.render('tti/main.ejs', { loginUserData, disclosuerImages });
});

/* logout 구현
 */
router.get('/logout', isLoggedIn, async (req, res, next) => {
  //쿠키 삭제
  res.clearCookie('connect.sid');
  //세션 파괴
  req.session.destroy(function (err) {
    res.redirect('/');
  });
});

module.exports = router;

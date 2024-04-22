var express = require('express');
var router = express.Router();

/* signup page
- 호출주소체계 : http://localhost:3000/signup
*/
router.get('/', async (req, res, next) => {
  res.render('tti/signup.ejs', { title: 'Express' });
});

router.post('/', async (req, res, next) => {
  // 1. 데이터 추출
  // var floatingEmail = req.body.floatingEmail;
  // var floatingPassword = req.body.floatingPassword;
  // var floatingUsername = req.body.floatingUsername;

  // 2. json 객체로 정의
  // const member = {
  //   floatingEmail: floatingEmail,
  //   floatingPassword: floatingPassword,
  //   floatingUsername: floatingUsername,
  // };

  // 3. DB저장(SQL/ORM)
  // var registedMemberData = await db.Member.create(member);

  // 4. 로그인 페이지로 이동
  res.redirect('/login');
});

module.exports = router;

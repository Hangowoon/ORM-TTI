var express = require('express');
var router = express.Router();

/* GET home page.
- 메인 페이지 요청 라우팅 메소드
- 요청방식 : get방식
- 호출주소체계 : http://localhost:3000
- 응답결과 : views/index.ejs뷰파일의 내용을 클라이언트에 전달 
*/
router.get('/', async (req, res, next) => {
  res.render('index.ejs', { title: 'Express' });
});

// signup 페이지 요청
router.get('/signup', async (req, res, next) => {
  res.render('member/signup.ejs');
});
// signup 페이지 정보 처리
router.post('/signup', async (req, res, next) => {
  // 1. 데이터 추출
  var floatingEmail = req.body.floatingEmail;
  var floatingPassword = req.body.floatingPassword;
  var floatingUsername = req.body.floatingUsername;

  // 2. json 객체로 정의
  const member = {
    floatingEmail: floatingEmail,
    floatingPassword: floatingPassword,
    floatingUsername: floatingUsername,
  };

  // 3. DB저장(SQL/ORM)
  // var registedMemberData = await db.Member.create(member);

  // 4. 로그인 페이지로 이동
  res.redirect('/member/login');
});

// login 페이지 요청
router.get('/login', async (req, res, next) => {
  res.render('member/login.ejs');
});

module.exports = router;

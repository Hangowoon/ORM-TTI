var express = require('express');
var router = express.Router();

//db 연결
var db = require('../models/index.js');

// bcrypt 단방향 암호화
const bcrypt = require('bcryptjs');

/* signup page
- 호출주소체계 : http://localhost:3000/signup
*/
//회원가입 화면 페이지 호출
router.get('/', async (req, res, next) => {
  res.render('tti/signup.ejs', { signupResult: '' });
});

//회원가입 등록 처리
router.post('/', async (req, res, next) => {
  // 호출 반환형식
  var apiResult = {
    code: '', //호출결과값 200(정상처리), 400(요청리소스가 없는경우), 500(서버에러)
    data: {}, // 프론트엔드에 특정 값을 반환할때 해당 속성에 값을 넣어 줌
    resule: '', // 프론트엔드에게 처리 결과 추가 메시지를 전달하고 싶을 때 Ok, Failed
  };

  var signupResult = '';

  // 1. 데이터 추출
  var userEmail = req.body.userEmail;
  var userPassword = req.body.userPassword;
  var userName = req.body.userName;

  // 2. 이메일 중복 체크
  // 1)동일한 메일이 존재하는지 체크
  var newUser = await db.User_data.findOne({
    where: { user_email: userEmail },
  });

  // 1-1) 동일한 계정이 존재하는 경우 ; 동알한 계정이 존재한다고 알려줌
  if (newUser != null) {
    signupResult = '동일한 이메일이 존재합니다.';

    // 회원가입 ejs파일에 결과 데이터 전달
    res.render('tti/signup.ejs', { signupResult });
  } else {
    //패스워드 단방향 암호화
    const encryptedPassword = await bcrypt.hash(userPassword, 12);

    // 데이터 바인딩
    var user = {
      user_email: userEmail,
      user_password: encryptedPassword,
      user_name: userName,
      user_profile_img_path: '/assets/img/user/profile.jpg',
      reg_date: Date.now(),
      edit_date: Date.now(),
      delete_date: Date.now(),
    };

    // DB저장(SQL/ORM)
    var registedUserData = await db.User_data.create(user);

    signupResult = ' 회원가입이 완료되었습니다.';

    // 로그인 페이지로 이동
    res.redirect('/login');

    // 1-2) 동일한 계정이 존재하지 않는 경우 : 새로운 계정 생성
    // try {
    //   //패스워드 단방향 암호화
    //   const encryptedPassword = await bcrypt.hash(userPassword, 12);

    //   // 데이터 바인딩
    //   var user = {
    //     user_email: userEmail,
    //     user_password: encryptedPassword,
    //     user_name: userName,
    //     user_profile_img_path: '/assets/img/user/profile.jpg',
    //     reg_date: Date.now(),
    //     edit_date: Date.now(),
    //     delete_date: Date.now(),
    //   };

    //   // DB저장(SQL/ORM)
    //   var registedUserData = await db.User_data.create(user);

    //   apiResult.code = '200';
    //   apiResult.data = registedUserData;
    //   apiResult.result = 'Ok';

    //   signupResult = ' 회원가입이 완료되었습니다.';

    //   // 로그인 페이지로 이동
    //   res.redirect('/login');
    // } catch (Err) {
    //   apiResult.code = '500';
    //   apiResult.data = {};
    //   apiResult.result = 'Failed, Server Error';
    // }
  }
});

module.exports = router;

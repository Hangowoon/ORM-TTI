var express = require('express');
var router = express.Router();

//db 연결
var db = require('../models/index.js');

// bcrypt 단방향 암호화
const bcrypt = require('bcryptjs');

/* login page
- 호출주소체계 : http://localhost:3000/login
*/
router.get('/', async (req, res, next) => {
  res.render('tti/login.ejs', { loginResult: '' });
});

router.post('/', async (req, res, next) => {
  // 처리 결과 메시지
  var loginResult = '';

  // 1. 데이터 추출
  var userEmail = req.body.userEmail;
  var userPassword = req.body.userPassword;

  // 2. 데이터 체크
  // 1) 동일한 메일 존재하는지 체크
  var loginUser = await db.User_data.findOne({
    where: { user_email: userEmail },
  });

  // 1-1)동일한 계정이 존재하지 않는 경우 : 계정이 존재하지 않음을 알려줌
  if (loginUser == null) {
    loginResult = '이메일이 존재하지 않습니다.';

    //로그인 ejs파일에 결과 데이터 전달
    res.render('tti/login.ejs', { loginResult });
  } else {
    // 1-2) 동일한 계정 존재하는 경우 : 비밀번호 체크
    var isCorrentPwd = await bcrypt.compare(
      userPassword,
      loginUser.user_password
    );

    // 2-1)비밀번호 일치하는 경우: 세션저장
    if (isCorrentPwd) {
      console.log('세션정보확인', req.session);
      req.session.isLogined = true;

      //세션
      req.session.isLognUser = {
        user_id: loginUser.user_id,
        user_email: loginUser.user_email,
        user_name: loginUser.user_name,
        user_profile_img_path: loginUser.user_profile_img_path,
        reg_date: loginUser.reg_date,
        edit_date: loginUser.edit_date,
        delete_date: loginUser.delete_date,
      };

      //세션 저장 후 페이지로 이동
      req.session.save(function () {
        res.redirect('/main');
      });
    } else {
      //2-2)비밀번호가 불일치 하는 경우 : 비밀번호 틀렸음을 알려줌
      loginResult = '암호가 일치하지 않습니다.';

      //로그인 ejs파일에 결과 데이터 전달
      res.render('tti/login.ejs', { loginResult });
    }
  }
});

module.exports = router;

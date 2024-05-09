// bcrypt 단방향 암호화
const bcrypt = require('bcryptjs');

const LocalStrategy = require('passport-local').Strategy;

module.exports = (passport) => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'userEmail', //로그인 페이지의 사용자아이디 UI INPUT 요소 name값
        passwordField: 'userPassword', //로그인 페이지의 사용자 암호 INPUT 요소 name값
      },
      async (userId, userPWD, done) => {
        try {
          // 1. 계정 아이디(이메일) 조회
          const exUser = await db.User_data.findOne({
            where: { user_email: userId },
          });
          if (exUser) {
            // 2-1. 동일한 아이디(이메일) 존재하는 경우 : 비밀번호 암호화
            const result = await bcrypt.compare(userPWD, exUser.user_password);

            if (result) {
              //3-1. 사용자 암호가 일치한 경우 : 로그인 사용자 정보 세션 정보 생성
              var sessionUser = {
                user_id: exUser.user_id,
                user_email: exUser.user_email,
                user_name: exUser.user_name,
                user_profile_img_path: exUser.user_profile_img_path,
                reg_date: exUser.reg_date,
                edit_date: exUser.edit_date,
                delete_date: exUser.delete_date,
              };

              done(null, sessionUser);
            } else {
              //3-2. 사용자 암호가 일치하지 않은 경우
              done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
            }
          } else {
            //2-2. 사용자 아이디가 존재하지 않은경우
            done(null, false, { message: '아이디가 존재하지 않습니다.' });
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};

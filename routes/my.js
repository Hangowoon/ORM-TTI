var express = require('express');
var router = express.Router();

//db 연결
var db = require('../models/index.js');

// 세션 미들웨어 참조
const { isLoggedIn, isNotLoggedIn } = require('./sessionMiddleware');

const AES = require('mysql-aes');

// bcrypt 단방향 암호화
const bcrypt = require('bcryptjs');

//파일 업로드 지원 노드팩키지 참조
var multer = require('multer');

// moment.js 참조
var moment = require('moment');

// 이미지 sharp 참조
//const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

//파일 저장 위치 지정
var storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'public/upload/profile/'); //업로드 경로 설정
  },
  filename(req, file, cb) {
    cb(
      null,
      `${moment(Date.now()).format('YYYYMMDDHHmmss')}__${file.originalname}`
    ); // 파일명 설정
  },
});

//일반 업로드 처리 객체 생성
var upload = multer({ storage: storage });

/* my page.
- 호출주소체계 : http://localhost:3000/my
*/
router.get('/', isLoggedIn, async (req, res, next) => {
  //로그인한 사용자 세션 정보 추출
  var isLogined = req.session.isLogined;
  var loginUserData = req.session.loginUser;

  try {
    // 내가 만든 이미지만 갤러리 리스트에 보여줌
    var loginUserImages = await db.Generated_data.findAll({
      where: { reg_user_id: loginUserData.user_id },
    });

    var newLoginUser = await db.User_data.findOne({
      where: { user_id: loginUserData.user_id },
    });

    // 이미지 데이터 경로 변경 처리
    // ./public/upload/profile/001.png  ==> /upload/profile/001.png
    // loginUserData.forEach((item, index) => {
    //   item.dataValues.data_save_path = item.dataValues.data_save_path.replace(
    //     './publec',
    //     ''
    //   );
    // });
  } catch (err) {
    console.error(err);
    next(err);
  }

  res.render('tti/my.ejs', {
    isLogined,
    loginUserData,
    loginUserImages,
    newLoginUser,
  });
});

// 프로필 정보 수정 처리
// upload.single('file') : input name 값 과 동일해야 함
router.post(
  '/upload/profile',
  upload.single('profileImg'),
  async (req, res, next) => {
    //로그인한 사용자 세션 정보 추출
    var isLogined = req.session.isLogined;
    var loginUserData = req.session.loginUser;

    //업로드된 프로필 파일정보 추출
    const uploadFile = req.file; // 프로필 이미지
    const userName = req.body.name; // 이름
    const userPassword = req.body.password; //패스워드

    //패스워드 단방향 암호화
    const encryptedPassword = await bcrypt.hash(userPassword, 12);

    try {
      // 파일이 변경되었을 때 : 프로필 이미지 변경
      if (uploadFile) {
        // 프로필 이미지 경로
        var filePath = '/upload/profile/' + uploadFile.filename; //서버에 저장된 파일 경로 추출
        var fileName = uploadFile.filename; //서버에 업로드된 파일 이름
        var fileOrignalName = uploadFile.originalname; // 사용자가 업로드한 오리지널 파일이름
        var fileSize = uploadFile.size; // 업로드된 파일 사이즈
        var fileType = uploadFile.mimetype; // 업로드된 파일 형식

        //이미지 사이즈 조정
        // const processedImage = await sharp(imagePath).resize(120, 120).jpeg({quality: 100}).toBuffer();

        //이미지 비동기로 파일에 쓰기
        //await fs.promises.writeFile(filePath, processedImage);

        //경로 패스정보 수정
        // /public//uploads-userImages/1714361916977-_0520c564-aa8e-4822-8b82-a188d73ac9b0.jpeg  => /public 경로 제거
        // profileImagePath = profileImagePath.replace("public", "");
        profileImagePath = filePath.replace('/public', '');

        //사용자 프로필 정보 수정
        await db.User_data.update(
          {
            user_profile_img_path: profileImagePath,
            user_name: userName,
            user_password: encryptedPassword,
          },
          {
            where: { user_id: loginUserData.user_id }, // where 조건
          }
        );
      } else {
        //파일이 변경되지 않았을 때 : 프로필 이름, 비밀번호 변경
        await db.User_data.update(
          {
            user_name: userName,
            user_password: encryptedPassword,
          },
          {
            where: { user_id: loginUserData.user_id }, // where 조건
          }
        );
      }
    } catch (err) {
      console.log(err);
      next(err);
    }

    res.redirect('/my');
  }
);

// 이미지 공개여부 수정 처리
router.post('/upload/disclosure', async (req, res, next) => {
  //로그인한 사용자 세션 정보 추출
  var isLogined = req.session.isLogined;
  var loginUserData = req.session.loginUser;

  try {
    // 1. 데이터 추출
    var disclosure = req.body.disclosure;
    var dataId = req.body.dataId;

    // 3. DB저장
    var registedImgDisclosure = await db.Generated_data.update(
      {
        data_disclosure: disclosure,
      },
      {
        where: { reg_user_id: loginUserData.user_id, data_id: dataId }, // where 조건
      }
    );
  } catch (err) {
    console.log('OpenAI DALL.E3 API 호출 에러발생:', err);
    next(err);
  }

  res.redirect('/my');
});

// 이미지 삭제 처리

module.exports = router;

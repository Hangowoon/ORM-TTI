var express = require('express');
var router = express.Router();

//db 연결
var db = require('../models/index.js');

// 세션 미들웨어 참조
const { isLoggedIn, isNotLoggedIn } = require('./sessionMiddleware');

/* gallery page.
- 호출주소체계 : http://localhost:3000/gallery
*/

// 갤러리 웹페이지
router.get('/', isLoggedIn, async (req, res, next) => {
  //로그인한 사용자 세션 정보 추출
  var isLogined = req.session.isLogined;
  var loginUserData = req.session.loginUser;

  try {
    // 공개된 이미지만 갤러리 리스트에 보여줌
    var disclosuerImages = await db.Generated_data.findAll({
      //비공개:0, 공개:1
      where: { data_disclosure: 1 },
    });

    // 리스트에 보여줄 이미지 데이터 경로 변경 처리
    // ./public/upload/img/001.jpg  ==> /upload/img/001.jpg
    // disclosuerImage.forEach((item, index) => {
    //   item.dataValuse.data_save_path = item.dataValuse.data_save_path.replace(
    //     './public',
    //     ''
    //   );
    // });

    console.log(disclosuerImages[0].data_save_pat);
  } catch (err) {
    console.log(err);
    next(err);
  }
  res.render('tti/gallery.ejs', {
    loginUserData,
    disclosuerImages,
  });
});

// 기존 갤러리 데이터 불러오기
router.post('/', async (req, res, next) => {
  res.redirect('');
});

module.exports = router;

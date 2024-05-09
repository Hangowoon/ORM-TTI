var express = require('express');
var router = express.Router();

//db 연결
var db = require('../models/index.js');

// 세션 미들웨어 참조
const { isLoggedIn, isNotLoggedIn } = require('./sessionMiddleware');

//OpenAI 참조하기
const { OpenAI } = require('openai');

//생성후 생성된 파일 저장을 위한 axios, fs 참조
const axios = require('axios');
const fs = require('fs');

// moment.js 참조
var moment = require('moment');

/* create page.
- 호출주소체계 : http://localhost:3000/create
*/
router.get('/', isLoggedIn, async (req, res, next) => {
  //로그인한 사용자 세션 정보 추출
  var isLogined = req.session.isLogined;
  var loginUserData = req.session.loginUser;

  // DELL.E3 api 기반 TextToImage 생성 샘플
  let imageURL = 'assets/img/create/img_create.png';
  let imageBinaryData = '';

  res.render('tti/create.ejs', {
    loginUserData,
    result: '',
    imageURL,
    imageBinaryData,
  });
});

// 이미지 생성 처리
router.post('/', async (req, res, next) => {
  var loginUserData = req.session.loginUser;

  var result = '';

  let imageURL = '';
  let imageBinatyData = '';

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    // 1. 데이터 추출
    // req.body.name 값 적용
    var model = req.body.version;
    var prompt = req.body.prompt;
    var size = req.body.size;
    var style = 'vivid'; // vivid
    var response_format = 'url'; //b64_json or url

    //참고URL: https://platform.openai.com/docs/api-reference/images/createEdit
    // {
    //   model: dall-e-2, dall-e-2(default) or dall-e-3
    //   prompt: a white siamese cat, 최대길이:dall-e-2:1000자,dall-e-3:4000자
    //   n: 1,  생성할 이미지수 ,기본값:1 , dall-e-2:1-10사이,dall-e-3:1만지원
    //   size: 생성할 이미지크기,dall-e-2의 경우 256x256, 512x512 또는 1024x1024(기본값) 중 하나,dall-e-3 모델의 경우 1024x1024(기본값), 1792x1024 또는 1024x1792 중 하나.
    //   quality:생성할 이미지품질, standard(default) or hd(dall-e-3만지원-세밀하고일관성이 뛰어남)
    //   response_format: 반환형식 , url(기본값=60분간만 유효함) or b64_json(binarydata)
    //   style: 기본값:vivid(선명하고 초현실적이고 극적인 이미지를 생성) or natural (모델이 더 자연스럽고 덜 초현실적인 이미지를 생성-dall-e-3 만지원)
    //   user:
    // }

    // 2. openai generate로 이미지 데이터 생성 응답 처리
    const response = await openai.images.generate({
      model: model,
      prompt: prompt,
      n: 1,
      size: size,
      style: style,
      response_format: response_format,
    });

    // 3. 이미지 저장 경로 정의
    const imgFileName = `${moment(Date.now()).format('YYYYMMDDHHmmss')}.png`;
    let imgFilePath = `./public/upload/img/${imgFileName}`;

    if (response_format == 'url') {
      imageURL = response.data[0].url;

      axios({
        url: imageURL,
        responseType: 'stream',
      })
        .then((response) => {
          response.data
            .pipe(fs.createWriteStream(imgFilePath))
            .on('finish', () => {
              console.log('Image saved successfully.');
            })
            .on('error', (err) => {
              console.error('Error saving image:', err);
            });
        })
        .catch((err) => {
          console.error('Error downloading image:', err);
        });
    } else {
      imageBinaryData = response.data[0].b64_json;
      const buffer = Buffer.from(imageBinaryData, 'base64');
      fs.writeFileSync(imgFilePath, buffer);
      imageURL = `/upload/img/${imgFileName}`;
    }

    // let imgFilePath = `./public/upload/img/${imgFileName}`;

    // // 4-1. api 호출결과값 유형이 URL일 경우
    // if (response_format == 'url') {
    //   imageURL = response.data[0].url;

    //   axios({
    //     url: imageURL,
    //     responseType: 'stream',
    //   })
    //     .then((response) => {
    //       response.data
    //         .pipe(fs.createWriteStream(imgFilePath))
    //         .on('finish', () => {
    //           console.log('Image saved successfully.');
    //         })
    //         .on('error', (err) => {
    //           console.error('Error saving image:', err);
    //         });
    //     })
    //     .catch((err) => {
    //       console.error('Error downloading image:', err);
    //     });
    // } else {
    //   // 4-2. api 호출결과값 유형이 URL일 아닐경우
    //   // 바이너리 데이터 저장
    //   imageBinaryData = response.data[0].b64_json;
    //   const buffer = Buffer.from(imageBinaryData, 'base64');
    //   fs.writeFileSync(imgFilePath, buffer);
    //   imageURL = `/upload/img/${imgFileName}`;
    // }

    //이미지 경로 수정
    imgFileSavePath = imgFilePath.replace('./public', '');

    console.log('이미지 생성 URL:', response);

    //한국시간으로 변경하기
    // function getKoreanTimeIsoString() {
    //   const now = new Date(); // 현재 UTC 시간
    //   // const koreaTimeOffset = 9 * 60 * 60 * 1000; // 9시간을 밀리초로 변환
    //   // const koreanTime = new Date(now.getTime() + koreaTimeOffset); // 한국 시간
    //   return now.toISOString();
    // }

    // 데이터 추출
    // req.body.name 값
    // var data_prompt = req.body.prompt;
    // var data_ai_model_name = req.body.version;
    // var data_img_size = req.body.size;
    var reg_user_id = loginUserData.user_id;

    // 데이터 바인딩
    var generated = {
      reg_user_id: reg_user_id,
      data_prompt: prompt,
      data_ai_model_name: model,
      data_img_size: size,
      data_output_number: 1,
      data_save_path: imgFileSavePath ? imgFileSavePath : imageURL,
      data_disclosure: 0,
      reg_date: Date.now(),
      edit_date: Date.now(),
      delete_date: Date.now(),
    };

    //DB저장
    var registedGeneratedData = await db.Generated_data.create(generated);

    result = '이미지가 My Page에 저장되었습니다.';
  } catch (err) {
    console.log('OpenAI DALL.E3 API 호출 에러발생:', err);
    next(err);
  }

  res.render('tti/create.ejs', {
    result,
    imageURL,
    imageBinatyData,
  });
});

// 저장 버튼 처리
// router.post('/', async (req, res, next) => {
//   // 결과반환방식 정의
//   var result = '';

//   // 데이터 추출
//   // req.body.name 값
//   var data_prompt = req.body.prompt;
//   var data_ai_model_name = req.body.version;
//   var data_img_size = req.body.size;
//   var reg_user_id = req.session.loginUserData.user_id;

//   // 데이터 바인딩
//   var generated = {
//     reg_user_id: reg_user_id,
//     data_prompt: data_prompt,
//     data_ai_model_name: data_ai_model_name,
//     data_img_size: data_img_size,
//     data_output_number: 1,
//     data_save_path: imgFilePath ? imgFilePath : imageURL,
//     data_disclosure: 0,
//     reg_date: Date.now(),
//     edit_date: Date.now(),
//     delete_date: Date.now(),
//   };

//   //DB저장
//   var registedGeneratedData = await db.Generated_data.create(generated);

//   result = '저장이 완료되었습니다.';

//   res.render('tti/create.ejs', { result });
// });

module.exports = router;

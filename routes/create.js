var express = require("express");
var router = express.Router();

//생성후 생성된 파일 저장을 위한 axios, fs 참조
const axios = require("axios");
const fs = require("fs");

//사용자 로그인 인증 미들웨어 참조
const {isAuthenticated} = require("./middleware/authMiddleware.js");

//db 프로그래밍 참조
const db = require("../models/index.js");

//OpenAI 참조하기
const {OpenAI} = require("openai");

/* create page. get
- 호출주소체계 : http://localhost:3000/create
*/
router.get("/", isAuthenticated, async (req, res, next) => {
	let imageURL = "/generatedImages/sample-1714447542939.png";
	let imageBinaryData = "";
	const user = await db.User_data.findOne({where: {user_id: req.session.isLognUser.user_id}});
	const loginUserGenerateCount = user.generate_count;

	res.render("tti/create.ejs", {title: "Create", imageURL, imageBinaryData, generateCount: loginUserGenerateCount});
});

/* create page. post
- 호출주소체계 : http://localhost:3000/create
*/
router.post("/", isAuthenticated, async (req, res, next) => {
	let imageURL = "";
	let imageBinaryData = "";

	try {
		const user = await db.User_data.findOne({where: {user_id: req.session.isLognUser.user_id}});

		let apiKey = process.env.OPENAI_API_KEY;

		//만약에 조회해온 유저정보의 generate_count 값이 0이하이면 제한 메세지 반환
		if (user.generate_count <= 0) {
			//create.ejs 화면에서 apikey를 전달해주지 않았다면
			if (!req.body.apiKey) {
				return res.render("tti/create.ejs", {title: "Create", imageURL, imageBinaryData, generateCount: user.generate_count});
			}
			//user.generate_count가 0이하이고 화면에서 apiKey가 잘전달되면 apiKey 변수에 화면에서 전달한 req.body.apiKey를 넣어준다.
			apiKey = req.body.apiKey;
		}

		var model = req.body.modelVersion;
		var prompt = req.body.floatingPrompt;
		var size = req.body.imageSize;
		var style = "vivid"; // vivid
		var response_format = "url"; //b64_json or url
		var openaiApi = apiKey; // 최종 apikey 할당!

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

		const openai = new OpenAI({
			apiKey: openaiApi,
		});

		const response = await openai.images.generate({
			model: model,
			prompt: prompt,
			n: 1,
			size: size,
			style: style,
			response_format: response_format,
		});

		const imgFileName = `sample-${Date.now()}.png`;
		let imgFilePath = `./public/generatedImages/${imgFileName}`;

		if (response_format == "url") {
			imageURL = response.data[0].url;

			axios({
				url: imageURL,
				responseType: "stream",
			})
				.then((response) => {
					response.data
						.pipe(fs.createWriteStream(imgFilePath))
						.on("finish", () => {
							console.log("Image saved successfully.");
						})
						.on("error", (err) => {
							console.error("Error saving image:", err);
						});
				})
				.catch((err) => {
					console.error("Error downloading image:", err);
				});
		} else {
			imageBinaryData = response.data[0].b64_json;
			const buffer = Buffer.from(imageBinaryData, "base64");
			fs.writeFileSync(imgFilePath, buffer);
			imageURL = `/generatedImages/${imgFileName}`;
		}

		//데이터 베이스에 저장되는 경로 변경 단, 여기서 바꾸면 모든 경로 코드 체크를 진행하야합니다.
		// imgFilePath = imgFilePath.replace("./public","");

		console.log("이미지 생성 URL:", response);

		//한국시간으로 변경하기

		function getKoreanTimeIsoString() {
			const now = new Date(); // 현재 UTC 시간
			// const koreaTimeOffset = 9 * 60 * 60 * 1000; // 9시간을 밀리초로 변환
			// const koreanTime = new Date(now.getTime() + koreaTimeOffset); // 한국 시간
			return now.toISOString();
		}

		await db.Generated_data.create({
			reg_user_id: req.session.isLognUser.user_id,
			data_prompt: prompt,
			data_ai_model_name: model,
			data_img_size: size,
			data_output_number: 1,
			data_save_path: imgFilePath ? imgFilePath : imageURL,
			data_disclosure: 1,
			reg_date: getKoreanTimeIsoString(),
		});

		// 성성에 생공한 경우 if문으로 user.generate_count >0 초과인 경우만 생성 횟수 차감

		if (user.generate_count > 0) {
			//생성 횟수 차감
			await user.update({generate_count: user.generate_count - 1});
		}

		res.render("tti/create.ejs", {title: "Create", imageURL, imageBinaryData, generateCount: user.generate_count});
	} catch (err) {
		console.log("OpenAI DALL.E3 API 호출 에러발생:", err);
		next(err);
	}
});

module.exports = router;

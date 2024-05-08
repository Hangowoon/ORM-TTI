var express = require("express");
var router = express.Router();
var db = require("../models/index.js");
//사용자 로그인 인증 미들웨어 참조
const {isAuthenticated} = require("./middleware/authMiddleware.js");

//이미지 업로드를 위한 multer 객체 참조
const multer = require("multer");

//이미지 sharp를 통한 사용자 프로필 이미지업로드시 사이즈 조정

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "public/uploads-userImages/"); // 이미지가 저장될 경로
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + "-" + file.originalname); // 파일 이름 설정
	},
});

const upload = multer({storage: storage});

/* my page.
- 호출주소체계 : http://localhost:3000/my
*/
router.get("/", isAuthenticated, async (req, res, next) => {
	//페이지 네이션을위한 변수 설정
	const page = parseInt(req.query.page) || 1; //프론트에서 전달해주는 현재 페이지 값
	const limit = 6; //한 페이지에 표시할 데이터 수
	// 현재 페에지 에서 직전페이지까지의 갯수를 세서 스킵하는 계산식 ex) 1page 3개데이터 표현일시 2page값이 넘어오면 (2-1) * 3 = 3개를 스킵하고 4번째부터 조회를 해서 가져오는 offset 변수 설정
	const offset = (page - 1) * limit;

	//나의 페이지 정보 출력을 위한 로그인 유저 user_id로 조건 조회
	try {
		var loginUser = await db.User_data.findOne({
			where: {user_id: req.session.isLognUser.user_id},
			attribute: ["user_id", "user_email", "user_name", "user_profile_img_path"],
		});

		//페이지 네이션이 적용된 조회 등록(생성)일 순으로 내림차순 정렬을 통한 가장 최신데이터 부터 조회
		var loginUserImage = await db.Generated_data.findAll({
			where: {reg_user_id: req.session.isLognUser.user_id},
			limit: limit,
			offset: offset,
			order: [["reg_date", "DESC"]],
		});

		// 토탈 페이지수 구하기
		var totalImages = await db.Generated_data.count({
			where: {reg_user_id: req.session.isLognUser.user_id},
		});
		// Math.ceil 함수로 올림  4.4 => 5로 변환후 totalImages 정의
		totalImages = Math.ceil(totalImages / limit);

		// 보내줄 이미지데이터 경로 변경 처리  ./public/generatedImages/sample-1714463990962.png  ==> /generatedImages/sample-1714463990962.png
		loginUserImage.forEach((item, index) => {
			item.dataValues.data_save_path = item.dataValues.data_save_path.replace("./public", "");
		});
	} catch (err) {
		console.error(err);
		next(err);
	}
	//db에서 조회해온 정보로 loginUser정보 view에 전달
	res.render("tti/my.ejs", {title: "My Page", loginUser, loginUserImage, currentPage: page, totalImages});
});

//http://localhost:3000/my/update-profile

router.post("/update-profile", isAuthenticated, upload.single("profileImage"), async (req, res, next) => {
	const userName = req.body.name;

	try {
		if (req.file) {
			let profileImagePath = req.file.path;
			const imagePath = path.join(__dirname, "../", profileImagePath);
			//이미지 사이즈 조정
			const processedImage = await sharp(imagePath).resize(120, 120).jpeg({quality: 100}).toBuffer();
			//이미지 비동기로 파일에 쓰기
			await fs.promises.writeFile(imagePath, processedImage);

			//경로 패스정보 수정
			// /public//uploads-userImages/1714361916977-_0520c564-aa8e-4822-8b82-a188d73ac9b0.jpeg  => /public 경로 제거
			// profileImagePath = profileImagePath.replace("public", "");
			profileImagePath = profileImagePath.replace("public", "");

			//사용자 프로필 이름, 이미지 프로필 수정
			await db.User_data.update(
				{
					user_name: userName, // 업데이트할 데이터
					user_profile_img_path: profileImagePath, // 업데이트할 데이터
				},
				{
					where: {user_id: req.session.isLognUser.user_id}, // where 조건
				}
			);
		} else {
			//사용자 프로필 이름
			await db.User_data.update(
				{
					user_name: userName, // 업데이트할 데이터
				},
				{
					where: {user_id: req.session.isLognUser.user_id}, // where 조건
				}
			);
		}
	} catch (err) {
		console.error(err);
		next(err);
	}
	res.redirect("/my");
});

// Express 라우터 설정
router.put("/update-image/:imageId", isAuthenticated, async (req, res, next) => {
	const {data_ai_model_name, data_img_size, data_prompt} = req.body;
	const {imageId} = req.params;

	try {
		await db.Generated_data.update({data_ai_model_name, data_img_size, data_prompt}, {where: {data_id: imageId, reg_user_id: req.session.isLognUser.user_id}});
		res.status(200).json({message: "데이터가 수정되었습니다!"}); // JSON 응답 전송
	} catch (error) {
		console.error("Failed to update image:", error);
		res.status(500).json({error: "Error updating image", details: error.message}); // 오류 정보를 포함한 JSON 응답 전송
	}
});

// 이미지 삭제 처리 / 서버에서 실제 이미지 삭제 없이 처리하는 코드!
// router.delete("/delete-image/:imageId", isAuthenticated, async (req, res) => {
// 	const {imageId} = req.params;
// 	try {
// 		const result = await db.Generated_data.destroy({
// 			where: {data_id: imageId, reg_user_id: req.session.isLognUser.user_id},
// 		});
// 		if (result > 0) {
// 			res.status(200).send({message: "성공적으로 이미지가 삭제되었습니다."});
// 		} else {
// 			res.status(404).send({message: "삭제이미지를 찾을수가 없습니다."});
// 		}
// 	} catch (error) {
// 		console.error("Failed to delete image:", error);
// 		res.status(500).send({error: "이미지 삭제에 실패하였습니다.", details: error.message});
// 	}
// });

// 이미지 삭제 처리 /서버에서 실제 이미지 삭제를 하고 데이터베이스에서 이미지 삭제

router.delete("/delete-image/:imageId", isAuthenticated, async (req, res) => {
	const {imageId} = req.params;
	try {
		// 먼저 이미지 정보를 데이터베이스에서 조회
		const imageData = await db.Generated_data.findOne({
			where: {data_id: imageId, reg_user_id: req.session.isLognUser.user_id},
		});

		if (imageData) {
			// 파일 시스템에서 이미지 파일 삭제
			let filePath = imageData.data_save_path.replace(".", "");

			filePath = path.join(__dirname, "..", imageData.data_save_path);
			fs.unlink(filePath, async (err) => {
				if (err) {
					console.error("파일삭제에 실패하였습니다!:", err);
					return res.status(500).send({message: "파일 시스템에서 이미지 삭제에 실패하였습니다."});
				}
				// 파일 삭제 후 데이터베이스 레코드 삭제
				const result = await db.Generated_data.destroy({
					where: {data_id: imageId},
				});
				if (result > 0) {
					res.status(200).send({message: "성공적으로 이미지가 삭제되었습니다."});
				} else {
					res.status(404).send({message: "삭제 이미지를 찾을 수가 없습니다."});
				}
			});
		} else {
			res.status(404).send({message: "삭제 이미지를 찾을 수가 없습니다."});
		}
	} catch (error) {
		console.error("Failed to delete image:", error);
		res.status(500).send({error: "이미지 삭제에 실패하였습니다.", details: error.message});
	}
});

//이미지 공개여부 처리

router.put("/update-closure/:imageId", isAuthenticated, async (req, res) => {
	const {imageId} = req.params;
	try {
		const result = await db.Generated_data.update(
			{data_disclosure: req.body.data_closure},
			{
				where: {data_id: imageId, reg_user_id: req.session.isLognUser.user_id},
			}
		);

		if (result > 0) {
			res.status(200).send({message: "성공적으로 이미지 공개 여부가 설정되었습니다."});
		} else {
			res.status(404).send({message: "공개여부를 설정할 이미지를 찾을 수가 없습니다."});
		}
	} catch (error) {
		console.error("Failed to delete image:", error);
		res.status(500).send({error: "이미지 공개 여부 설정에 실패하였습니다.", details: error.message});
	}
});

module.exports = router;

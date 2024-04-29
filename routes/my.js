var express = require("express");
var router = express.Router();
var db = require("../models/index.js");

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
router.get("/", async (req, res, next) => {
	//나의 페이지 정보 출력을 위한 로그인 유저 user_id로 조건 조회
	try {
		var loginUser = await db.User_data.findOne({
			where: {user_id: req.session.isLognUser.user_id},
			attribute: ["user_id", "user_email", "user_name", "user_profile_img_path"],
		});
		// var loginUserImage = await db.generated_data.findAll({
		// 	where: {reg_user_id: req.session.isLognUser.user_id},
		// });
	} catch (err) {
		console.error(err);
		next(err);
	}
	//db에서 조회해온 정보로 loginUser정보 view에 전달
	res.render("tti/my.ejs", {title: "My Page", loginUser});
});

//http://localhost:3000/my/update-profile

router.post("/update-profile", upload.single("profileImage"), async (req, res, next) => {
	const userName = req.body.name;
	let profileImagePath = req.file ? req.file.path : req.session.isLognUser.user_profile_img_path;

	const imagePath = path.join(__dirname, "../", profileImagePath);

	try {
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
	} catch (err) {
		console.error(err);
		next(err);
	}
	res.redirect("/my");
});

module.exports = router;

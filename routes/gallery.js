var express = require("express");
var router = express.Router();
var db = require("../models/index.js");
const {isAuthenticated} = require("./middleware/authMiddleware.js");

/* gallery page.
- 호출주소체계 : http://localhost:3000/gallery
*/

// 갤러리 웹페이지
router.get("/", async (req, res, next) => {
	try {
		var closuerUserImage = await db.Generated_data.findAll({
			//1이면 공개 0이면 공개안함
			where: {data_disclosure: 1},
		});
		// 보내줄 이미지데이터 경로 변경 처리  ./public/generatedImages/sample-1714463990962.png  ==> /generatedImages/sample-1714463990962.png
		closuerUserImage.forEach((item, index) => {
			item.dataValues.data_save_path = item.dataValues.data_save_path.replace("./public", "");
		});
	} catch (err) {
		console.error(err);
		next(err);
	}

	res.render("tti/gallery.ejs", {title: "Gallery", closuerUserImage});
});

// 기존 갤러리 데이터 불러오기
router.post("/", async (req, res, next) => {
	res.redirect("");
});

module.exports = router;

var express = require("express");
var router = express.Router();

/* gallery page.
- 호출주소체계 : http://localhost:3000/gallery
*/

// 갤러리 웹페이지
router.get("/", async (req, res, next) => {
	try {
		var loginUserImage = await db.generated_data.findAll({
			where: {reg_user_id: req.session.isLognUser.user_id},
		});
	} catch (err) {}

	res.render("tti/gallery.ejs", {title: "Gallery"});
});

// 기존 갤러리 데이터 불러오기
router.post("/", async (req, res, next) => {
	res.redirect("");
});

// 기존 갤러리  다운로드 기능

// 기존 갤러리 좋아요 기능

module.exports = router;

var express = require("express");
var router = express.Router();

/* home page.
- 호출주소체계 : http://localhost:3000
*/
router.get("/", async (req, res, next) => {
	res.render("tti/home.ejs", {title: "Text To Image"});
});

/* main page.
- 호출주소체계 : http://localhost:3000/main
*/
router.get("/main", async (req, res, next) => {
	res.render("tti/main.ejs", {title: "TTI에 오신것을 환영합니다."});
});

router.get("/logout", async (req, res, next) => {
	// 쿠키를 클라이언트에서 삭제
	res.clearCookie("connect.sid"); // 'connect.sid'는 세션 쿠키의 기본 이름입니다.
	// 세션을 파괴
	req.session.destroy((err) => {
		if (err) {
			return res.status(500).send("Failed to logout.");
		}

		// 로그아웃 후 리다이렉트
		res.redirect("/");
	});
});

module.exports = router;

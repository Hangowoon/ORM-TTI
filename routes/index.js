const e = require("express");
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

router.get("/logout", (req, res) => {
	// 세션 확인
	if (req.session.isLogined) {
		// 세션 파괴

		req.session.destroy((err) => {
			if (err) {
				// 세션 파괴 중 에러 발생 시 처리
				console.error("Failed to destroy the session during logout.", err);
				next(err);
			}

			// 클라이언트에서 세션 쿠키 삭제
			// 'connect.sid'는 기본 세션 쿠키 이름입니다.
			// 사용하는 세션 쿠키의 이름이 다르다면 해당 이름으로 변경하세요.
			// 사용자 브라우저 쿠키부분삭제
			res.clearCookie("connect.sid");
			// 로그아웃 후 홈 페이지로 리다이렉트
			res.redirect("/");
		});
	} else {
		// 세션이 존재하지 않는 경우 바로 홈으로 리다이렉트
		res.redirect("/");
	}
});

module.exports = router;

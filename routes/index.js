const e = require("express");
var express = require("express");
var router = express.Router();
const db = require("../models/index");

/* home page.
- 호출주소체계 : http://localhost:3000
*/
router.get("/", async (req, res, next) => {
	const limit = 8; //한 페이지에 표시할 데이터 수
	var closuerUserImageHome = await db.Generated_data.findAll({
		//1이면 공개 0이면 공개안함
		where: {data_disclosure: 1},
		//페이지네이션을 위한 조건 추가
		limit: limit,
		order: [["reg_date", "DESC"]],
	});
	// 보내줄 이미지데이터 경로 변경 처리  ./public/generatedImages/sample-1714463990962.png  ==> /generatedImages/sample-1714463990962.png
	closuerUserImageHome.forEach((item, index) => {
		item.dataValues.data_save_path = item.dataValues.data_save_path.replace("./public", "");
	});
	res.render("tti/home.ejs", {title: "Text To Image", closuerUserImageHome});
});

/* main page.
- 호출주소체계 : http://localhost:3000/main
*/
router.get("/main", async (req, res, next) => {
	const limit = 8; //한 페이지에 표시할 데이터 수
	var closuerUserImageMain = await db.Generated_data.findAll({
		//1이면 공개 0이면 공개안함
		where: {data_disclosure: 1},
		//페이지네이션을 위한 조건 추가
		limit: limit,
		order: [["reg_date", "DESC"]],
	});
	// 보내줄 이미지데이터 경로 변경 처리  ./public/generatedImages/sample-1714463990962.png  ==> /generatedImages/sample-1714463990962.png
	closuerUserImageMain.forEach((item, index) => {
		item.dataValues.data_save_path = item.dataValues.data_save_path.replace("./public", "");
	});
	res.render("tti/main.ejs", {title: "TTI에 오신것을 환영합니다.", closuerUserImageMain});
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

exports.isAuthenticated = (req, res, next) => {
	if (req.session.isLogined) {
		return next();
	} else {
		res.redirect("/login");
	}
};

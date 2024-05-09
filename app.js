var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//express기반 서버세션 관리 팩키지 참조하기
var session = require('express-session');

//dotenv 어플리케이션 환경설정관리 팩키지 참조 및 구성하기
require('dotenv').config();

//CORS 접근 이슈 해결을 위한 cors패키지 참조
const cors = require('cors');

//레이아웃 패키지 참조
var expressLayouts = require('express-ejs-layouts');

//라우터 생성
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var signupRouter = require('./routes/signup');
var loginRouter = require('./routes/login');
var myRouter = require('./routes/my');
var createRouter = require('./routes/create');
var galleryRouter = require('./routes/gallery');

//// ORM 기반 DB 연결 정보 참조하기 / DB객체 안에 Sequelize 불러옴
var sequelize = require('./models/index').sequelize;

var app = express();

//// mysql과 자동연결처리 및 모델기반 물리 테이블 생성처리제공
sequelize.sync();

//session
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: 'testsecret',
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60, //5분동안 서버세션을 유지하겠다.(1000은 1초)
    },
  })
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//레이아웃 설정
app.set('layout', 'layout/layout.ejs'); // 해당 노드앱의 모든 콘텐츠 뷰파일의 기본 레이아웃 ejs파일
app.set('layout extractScripts', true); // 콘텐츠페이지내 script태그를 레이아웃에 통합할지여부
app.set('layout extractStyles', true); // 콘텐츠페이지내 style태그를 레이아웃에 통합할지여부
app.set('layout extractMetas', true); // 콘텐츠페이지내 meta태그를 레이아웃에 통합할지여부
app.use(expressLayouts);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//node_modules에있는 패키지 직접 참조를 위한 설정 부트스트랩 직접 참조가능
app.use('/scripts', express.static(__dirname + '/node_modules'));

// 라우터 경로
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/signup', signupRouter);
app.use('/login', loginRouter);
app.use('/my', myRouter);
app.use('/create', createRouter);
app.use('/gallery', galleryRouter);

// 캐치올 라우터: 정의되지 않은 모든 경로를 홈으로 리다이렉션
app.get('*', (req, res) => {
  res.redirect('/');
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

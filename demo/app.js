let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let mongoose = require('mongoose');
let Cookies=require("cookies");
let bodyParser = require('body-parser');
let indexRouter = require('./routes/index');
let adminRouter = require('./routes/admin');
let regRouter = require('./routes/api');
let moment = require('moment');
let shortDateFormat = 'ddd @ h:mm';

//生成express实例
let app = express();
let Admin=require("./models/Schema");

// 设置视图引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//使用上面的引入文件或者包
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//接受post
app.use(bodyParser.urlencoded({extended:true}));
//设置cookie
app.use(function (req,res,next) {
    //解析登录用户的cookie信息
    req.cookies=new Cookies(req,res);
    req.userInfo={};
    if(req.cookies.get("userInfo")){
        try{
            req.userInfo=JSON.parse(req.cookies.get("userInfo"));
            //获取当前用户的类型
            Admin.findById(req.userInfo._id).then(function (userInfo) {
            req.userInfo.isAdmin=Boolean(userInfo.isAdmin);
            next();
            });

        }catch(e){
            
            next();
        }
    }else{
        next();
    }

});
app.locals.moment = moment;
app.locals.shortDateFormat = shortDateFormat;
//用户访问路由
app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/api', regRouter);
//数据库链接
mongoose.connect('mongodb://localhost/mongoose');
let db = mongoose.connection;
db.once('open', function() {
    console.log('连接成功');
});
db.on('error', ()=>{
    console.log("连接失败")
});

db.once('close', function() {
    console.log('数据库断开成功');
});
// mongoose.connect("mongodb://127.0.0.1:27017/mongoose",(err)=>{
//   if(err){
//     console.log("连接数据库失败");
//   }else{
//     console.log("连接数据库成功");
//   }
// });
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

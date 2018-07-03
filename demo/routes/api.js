let express = require('express');
let router = express.Router();
//引入数据库
let Schema=require('../models/Schema');
let Content=require('../models/Content');
//统一格式
let responseDate;
router.use(function (req, res, next) {
    //初始化接受过来的请求数据
    responseDate={
        code:0,
        message:''
    }
   return next();
});
/*
 * 注册的一系列验证和处理 */
router.post('/user/register', function(req, res, next) {
    // res.render('reg', { title: '注册' });
    let username=req.body.username;
    let password=req.body.password;
    let regPassword=req.body.regPassword;
    if(username == ''){
        responseDate.code=1;
        responseDate.message = "用户名不能为空";
        res.json(responseDate);
        return;
    }
    if(password == ''){
        responseDate.code=2;
        responseDate.message = "密码不能为空";
        res.json(responseDate);
        return;
    }
    if(password != regPassword){
        responseDate.code=3;
        responseDate.message = "两次输入的密码不一致";
        res.json(responseDate);
        return;
    }
    //用户名是否被注册了
    Schema.findOne({
       username:username
   }).then(function (userInfo) {
       if(userInfo){
           responseDate.code=4;
           responseDate.message='用户名已经存在';
           res.json(responseDate);
           return;
       }
        //如果不存在同名的就保存数据库中
        let user = new Schema({
            username:username,
            password:password
        });

        return user.save();
   }).then(function (newUser) {
        console.log(newUser);
        responseDate.message="注册成功";
        res.json(responseDate);
        return;
    });
});
router.post('/user/login',function (req,res,next) {
    let username=req.body.username;
    let password=req.body.password;
    if(username==''||password==''){
        responseDate.code=1;
        responseDate.message='用户名和密码不能为空';
        res.json(responseDate);
        return;
    }
    //查询数据库中密码和用户名是否存在
    Schema.findOne({
       username:username,
       password:password
    }).then(function (userInof) {
        if(!userInof){
            responseDate.code=2;
            responseDate.message='用户名和密码错误';
            res.json(responseDate);
            return;
        }
        //用户名和密码正确
        responseDate.message='登录成功';
        responseDate.userInfo={
            _id:userInof._id,
            username:userInof.username
        }
        req.cookies.set('userInfo',JSON.stringify({
            _id:userInof._id,
            username:userInof.username
        }))
        res.json(responseDate);
        return;
    });
});
//退出登录
router.get('/user/logout',function (req,res) {
   req.cookies.set('userInfo',null);
   responseDate.message='退出成功';
   res.json(responseDate);
});
//评论提交
router.post('/comment/post',function (req,res) {
    //内容ID
    let contentId=req.body.contentid||'';
   let postData = {
       username:req.userInfo.username,
       postTime:new Date(),
       content:req.body.content
   }
   //查询当前内容的信息
    Content.findOne({
        _id:contentId
    }).then(function (content) {
        content.comments.push(postData);
       return content.save();
    }).then(function (newContent) {
        responseDate.message='评论成功';
        responseDate.data=newContent;
        res.json(responseDate);
    });
});
//获取指定文章的所有评论
router.get('/comment',function (req,res) {
    let contentId=req.query.contentid||'';
    Content.findOne({
        _id:contentId
    }).then(function (content) {
        responseDate.data=content.comments;
        res.json(responseDate);
    })
});

module.exports = router;

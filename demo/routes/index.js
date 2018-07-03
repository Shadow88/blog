let express = require('express');
let router = express.Router();
let Category=require("../models/Category");
let Content=require("../models/Content");
let data;
/***
 * 处理通用数据
 */
router.use(function (req,res,next) {
     data={
         userInfo:req.userInfo,
         categories:[],
     }
    Category.find().then(function (categories) {
         data.categories=categories;
         next();
    });
});
/* 前台首页*/
router.get('/', function(req, res, next) {

    data.page = parseInt(req.query.page || 1);
    data.limit = 10;
    data.pages = 0;
    data.count = 0;
    data.contents = [];
    data.category = req.query.category || '';

    let where = {};
    if (data.category) {
        where.category = data.category
    }
    //读取所有分类信息
    Content.where(where).count().then(function (count) {
        data.count = count;
        //计算总页数
        data.pages = Math.ceil(data.count / data.limit);
        //取值不能超过总页数
        data.page = Math.min(data.page, data.pages);
        //取值不能小于1
        data.page = Math.max(data.page, 1);
        let skip = (data.page - 1) * data.limit;
        return Content.where(where).find().limit(data.limit).skip(skip).populate(['category', 'schema']).sort({
            addTime: -1
        });
    }).then(function (contents) {
        data.contents = contents;
        res.render('index', data);
    });
});
/***
 * 跳转技能页面
 */

router.get('/skill',function (req,res) {
    res.render('skill');
});
/**
 *评论
 */
router.get('/view',function (req,res) {
     let contentId=req.query.contentid||'';
     let category=req.query.category||'';
     Content.findOne({
         _id:contentId
     }).then(function (content) {
        data.content=content;
        data.category=category;
        content.views++;
        content.save();
        res.render('view',data);
     });
});

module.exports = router;

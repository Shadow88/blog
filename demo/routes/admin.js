let express = require('express');
let router = express.Router({});
let Schema=require('../models/Schema');
let Category=require('../models/Category');
let Content=require('../models/Content');
router.use(function (req,res,next) {
    if(!req.userInfo.isAdmin){
        res.send('只有管理员账户可以进入该页面');
        return;
    }
    next();
});
//后台首页
router.get( '/',function(req,res,next){
    res.render("admin",{
        userInfo:req.userInfo
    });
});
//用户管理
router.get('/user',function (req,res,next) {
    //从数据库中读取所有的用户信息
    let page=parseInt(req.query.page || 1);

    let limit=2;
    let skip=(page-1)*limit;
    let pages=0;
    //分页
    Schema.count().then(function (count) {
       //计算总页数
        pages=Math.ceil(count/limit);

        //取值不能超过总页数
        page=Math.min(page,pages);

        //取值不能小于1
        page=Math.max(page,1);
        Schema.find().sort({_id:-1}).limit(limit).skip(skip).then(function (user) {

            res.render("user_index", {
                userInfo: req.userInfo,
                user:user,
                count:count,
                pages:pages,
                limit:limit,
                page:page
            });
        });
    });


});
//分类管理首页
router.get('/category',function (req,res) {

    //从数据库中读取所有的用户信息
    let page=parseInt(req.query.page || 1);
    let limit=2;
    let skip=(page-1)*limit;
    let pages=0;
    //分页
    Category.count().then(function (count) {
        //计算总页数
        pages=Math.ceil(count/limit);

        //取值不能超过总页数
        page=Math.min(page,pages);

        //取值不能小于1
        page=Math.max(page,1);

        Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function (categories) {

            res.render("category_index", {
                userInfo: req.userInfo,
                categories:categories,
                count:count,
                pages:pages,
                limit:limit,
                page:page
            });
            console.log("categories:"+categories);
        });
    });


});
//分类添加页面
router.get('/category/add',function (req,res) {
    res.render('category_add',{
        userInfo:req.userInfo
    });
});
//分类的保存
router.post('/category/add',(req,res)=> {
    let name = req.body.name || '';
    if(name == ''){
        res.render('err',{
            userInfo:req.userInfo,
            message:'名称不能为空',
        });
        return;
    }
        //数据库中是否存在相同的分类名称
        Category.findOne({
            name:name,

        }).then(function (categories) {
            if(categories) {
                res.render('err', {
                    userInfo: req.userInfo,
                    message: '分类已经存在了'
                });
                return Promise.reject();
            }else{
                //数据库中保存
                return new Category({
                    name:name
                }).save();
            }
        }).then(function (newCategory) {
            console.log("新的分类:"+newCategory);
            res.render('success',{
                userInfo:req.userInfo,
                message:'保存成功',
                url:'/admin',
                newCategory:newCategory
            })
        }).catch((error)=>{
            return res.json({error:error});
        });


});
//分类修改页面
router.get('/category/edit', (req,res) =>{
    let id=req.query.id||"";
    //获取要修改的分类信息
    /*Category.findOne({},function (err,category) {
        if(!category){
            res.render('err',{
                userInfo:req.userInfo,
                message:'分类信息不存在'
            });
        }else{
            res.render('category_edit',{
                userInfo:req.userInfo,
                category:category
            });
        }

    }).catch((error)=>{
        return res.json({error:error});
    });*/
    Category.findOne({
        _id:id
    }).then( (category)=> {
        console.log("id:"+id);
        console.log("分类:"+category);
        if(!category){
            console.log(category);
            res.render('err',{
                userInfo:req.userInfo,
                message:'分类信息不存在'
            });
        }else{
            res.render('category_edit',{
                userInfo:req.userInfo,
                category:category
            });
        }

    }).catch((error)=>{
        return res.json({error:error});
    });
});
//分类修改保存
router.post('/category/edit',function (req,res) {
 let id=req.query.id || "";
 let name=req.body.name || "";
    console.log("名字:"+name);
    Category.findOne({
     _id:id
 }).then( category=>{
     if(!category){
         console.log(category);
         res.render('err',{
             userInfo:req.userInfo,
             message:'分类信息不存在'
         });
         return Promise.reject();
     }else{
         if(name == category.name){
            //用户未作任何修改提交
             res.render('success',{
                 userInfo:req.userInfo,
                 message:'修改成功',
                 url:'/admin/category'
             });
             return Promise.reject();
         }else{
             Category.findOne({
                 _id:{$ne:id},//id不等于当前id
                 name:name
             });
         }
     }
 }).then( differentCategory =>{
     if(differentCategory){
         res.render('err',{
             userInfo:req.userInfo,
             message:'数据库中已经存在同名分类'
         });
         return Promise.reject();
     }else{
       return  Category.update({_id:id},{name:name});
     }
 }).then(function () {
     res.render('success',{
         userInfo:req.userInfo,
         message:'修改成功',
         url:'/admin/category'
     });
 });

});
//分类删除
router.get('/category/delete',function (req,res) {
    let id=req.query.id || "";
    Category.remove({
      _id:id
    }).then(function () {
        res.render('success',{
            userInfo:req.userInfo,
            message:'删除成功',
            url:'/admin/category'
        });
    });
});

/***
 * 内容管理首页
 *
 */
router.get('/content',function (req,res) {
    let page=parseInt(req.query.page || 1);
    let limit=2;
    let skip=(page-1)*limit;
    let pages=0;
    //分页
    Content.count().then(function (count) {
        //计算总页数
        pages=Math.ceil(count/limit);
        //取值不能超过总页数
        page=Math.min(page,pages);
        //取值不能小于1
        page=Math.max(page,1);
        Content.find().sort({_id:-1}).limit(limit).skip(skip).populate(['category','schema']).then(function (content) {
            console.log(content);
            res.render("content_index", {
                userInfo: req.userInfo,
                content:content,
                count:count,
                pages:pages,
                limit:limit,
                page:page,
            });
        });
    });


});
/***
* 内容添加
*
*/
router.get('/content/add',function (req,res) {


    Category.find().then(function (category) {
        res.render('content_add',{
            userInfo:req.userInfo,
            category:category
        });
    });

});
//内容保存
router.post('/content/add',function (req,res) {

    if(req.body.category == '') {
           res.render('err', {
               userInfo: req.userInfo,
               message: '分类内容不能为空',

           });
           return;
       }
           if(req.body.title=='') {
               res.render('err', {
                   userInfo: req.userInfo,
                   message: '标题不能为空',

               });
               return;
           }
               if(req.body.description=='') {
                   res.render('err', {
                       userInfo: req.userInfo,
                       message: '描述不能为空',

                   });
                   return;
               }

                   if(req.body.content=='') {
                       res.render('err', {
                           userInfo: req.userInfo,
                           message: '内容不能为空',

                       });
                       return;
                   }
    new Content({
        category:req.body.category,
        title:req.body.title,
        user:req.userInfo._id,
        description:req.body.description,
        content:req.body.content,
    }).save().then(function (rs) {
        res.render('err', {
            userInfo: req.userInfo,
            message: '内容保存成功',
            url:'content'
        });
    });


});
//内容修改
router.get('/content/edit',function (req,res) {
    let id=req.query.id||'';
    let category=[];
    Category.find().then(function (rs) {
        category=rs;

        return   Content.findOne({
            _id:id
        }).populate('category');
    }).then(function (content) {

        if(!content){
            res.render('err',{
                userInfo:req.userInfo,
                message:'指定内容不存在'
            });
            return Promise.reject();
        }else{
            res.render('content_edit',{
                userInfo:req.userInfo,
                content:content,
                category:category
            });
        }
    });;




});
/**
 * 保存修改内容
 */
router.post('/content/edit',function (req,res) {
   let id=req.query.id||'';
    if(req.body.title=='') {
        res.render('err', {
            userInfo: req.userInfo,
            message: '标题不能为空',

        });
        return;
    }
    if(req.body.description=='') {
        res.render('err', {
            userInfo: req.userInfo,
            message: '描述不能为空',

        });
        return;
    }

    if(req.body.content=='') {
        res.render('err', {
            userInfo: req.userInfo,
            message: '内容不能为空',

        });
        return;
    }
    Content.update({
       _id:id
    },{
        category:req.body.category,
        title:req.body.title,
        description:req.body.description,
        content:req.body.content,
    }).then(function () {
        res.render('success',{
            userInfo:req.userInfo,
            message:"保存成功",
            url:'/admin/content'
        })
    });
});
/**
 * 内容删除
 */
router.get('/content/delete',function (req,res) {
    let id=req.query.id || "";
    Content.remove({
        _id:id
    }).then(function () {
        res.render('success',{
            userInfo:req.userInfo,
            message:'删除成功',
            url:'/admin/content'
        });
    });
});

module.exports = router;

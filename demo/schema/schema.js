let mongoose=require("mongoose");
//用户表结构
module.exports = new mongoose.Schema({
    username:String,
    password:String,
    isAdmin:{
    type:Boolean,
default:false
}//是否为管理员
});

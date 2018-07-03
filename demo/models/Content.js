let mongoose=require("mongoose");
let content=require("../schema/content");
module.exports = mongoose.model('Content',content);

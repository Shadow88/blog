let mongoose=require("mongoose");
let categoriesSchema=require("../schema/categories");
module.exports = mongoose.model('Category',categoriesSchema);

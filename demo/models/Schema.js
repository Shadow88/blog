let mongoose=require("mongoose");
let usersSchema=require("../schema/schema");
module.exports = mongoose.model('Schema',usersSchema);

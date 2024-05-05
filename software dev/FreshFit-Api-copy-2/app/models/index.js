const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.set("strictQuery", false);

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.country = require("./country.model");
db.community = require("./community.model");
db.event = require("./event.model");
db.comment = require("./comment.model");

module.exports = db;

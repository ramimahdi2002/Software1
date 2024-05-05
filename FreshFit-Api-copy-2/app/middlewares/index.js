const authJwt = require("./authJwt");
const upload = require("./upload.middleware");

module.exports = {
  authJwt,
  upload,
};

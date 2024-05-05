const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Helpers = require("../helpers");

const ResponseHandler = Helpers.response;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, fs.realpathSync("./app/uploads"));
  },
  filename: (_req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const filename = `${uuidv4()}${fileExtension}`;
    cb(null, filename);
  },
});

// image upload
const checkFileTypeImage = (file, cb) => {
  const fileTypes = /jpg|jpeg|png|gif|svg/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  if (extname) {
    return cb(null, true);
  }

  cb(new Error("Only images are allowed"));
};

const imageUpload = multer({
  storage: storage,
  limits: { fileSize: 50000000 },
  fileFilter: (_req, file, cb) => {
    checkFileTypeImage(file, cb);
  },
});

const addToBody = async (req, res, next) => {
  const file = req.file;
  if (!file) {
    return ResponseHandler.badRequest(res, "File is required");
  }

  req.body.file = file.filename;

  next();
};

module.exports = {
  imageUpload,
  addToBody,
};

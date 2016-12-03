
/**
 * 文件上传
 */
const multer = require('koa-multer');
const config = require('../config');
const path = require('path');
const mkdirp = require('mkdirp');
const qn = require('qn');

let storage = multer.diskStorage({
  //设置上传后文件路径。
  destination: function (req, file, cb) {
    mkdirp(config.upload.path, function (err) {
      cb(err, config.upload.path);
    });
  }, 
  //给上传文件重命名，获取添加后缀名
  filename: function (req, file, cb) {
    let extname = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + extname);
  }
 });  

 function fileFilter (req, file, cb) {
  let extname = path.extname(file.originalname).slice(1);
  if(config.upload.extnames.indexOf(extname) != -1) {
    cb(null, true);
  } else {
    cb(new Error('您上传的文件格式不正确！请检查后重试'));
  }
 }


 if(config.qiniu.accessKey) {

   qn.prototype._handleFile = function (req, file, cb) {
    let extname = path.extname(file.originalname);
    file.filename = file.fieldname + '-' + Date.now() + extname;
    this.upload(file.stream, {key: file.filename}, function (err, result) {
      if(err) return cb(err);
      file.filename = result.key;
      cb(null, {
        path: result.key,
        size: file.encoding
      })
      // {
      //   hash: 'FvnDEnGu6pjzxxxc5d6IlNMrbDnH',
      //   key: 'FvnDEnGu6pjzxxxc5d6IlNMrbDnH',
      //   url: 'http://qtestbucket.qiniudn.com/FvnDEnGu6pjzxxxc5d6IlNMrbDnH',
      //   "x:filename": "foo.txt",
      // }
    });
   }
   storage = qn.create(config.qiniu);
 }

//添加配置文件到muler对象。
var upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {fileSize: config.upload.fileSize}
});


module.exports = upload;
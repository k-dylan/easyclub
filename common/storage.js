
const qn = require('qn');
const config = require('../config');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

let storage;

if(config.qiniu.accessKey && config.qiniu.accessKey !== 'you access key') {
  storage = qn.create(config.qiniu);
} else {
  // 创建上传目录
  mkdirp(config.upload.path, function (err) {
    if(err) 
      throw new Error('上传文件目录创建失败!');
  });
  
  storage = {
    upload (stream, options, cb) {
      let filePath = path.join(config.upload.path, options.key);

      stream.on('end', function () {
        cb(null, {
          key: options.key,
          url: filePath
        });
      })
      stream.pipe(fs.createWriteStream(filePath));
    },
    delete (filename, cb) {
      let filePath = path.join(config.upload.path, filename);
      fs.unlink(filePath, cb);
    }
  }
}

module.exports = storage;
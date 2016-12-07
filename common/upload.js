/**
 * 接受上传数据
 */

const Busboy = require('busboy');
const config = require('../config');
const storage = require('./storage');
const path = require('path');


module.exports = function (req, options, field) {
  if(arguments.length < 2) {
    throw new Error('upload 参数最少为2个!');
  }
  if(typeof options === 'string') {
    field = options;
    options = {};
  }

  options.headers = req.headers;
  options.limits = { fileSize: config.fileSize }
  const busboy = new Busboy(options);

  return new Promise((resolve, reject) => {
    let isLoaded = false;
    let isSaveed = false;
    let isError = false;
    let isDiscard = false;
    let file = null;
    busboy.on('finish', () => {
      isLoaded = true;
      done();
    })
    
    busboy.on('file', (fieldname, fileStream, filename, encoding, mimetype) => {
      // 过滤文件格式
      if(!/^image\/*/.test(mimetype)){
        isError = false;
        reject(new Error('您上传的文件格式不正确,请重试'))
        return false;
      }
      // 检测上传文件字段是否正确
      if(field !== fieldname) {
        isDiscard = true;
        fileStream.resume();
        return false;
      }
      
      file = {
        fieldname: fieldname,
        encoding: encoding,
        mimetype: mimetype,
        filename: null
      }
      
      fileStream.on('limit', function () {
        isError = true;
        reject(new Error('您添加的文件过大,请检查后重试!'));
      });

      storage.upload(fileStream, {key: getFilename(filename) }, (err, result) => {
        if(err) {
          isError = true; 
          return reject(err);
        }
        if(isError) {
          // 删除已上传到的文件
          storage.delete(result.key, () => {});
          return false;
        }

        file.filename = result.key;
        isSaveed = true;
        done();
      });
    })

    req.pipe(busboy);

    function done () {
      if(isLoaded && (isSaveed || isDiscard)) {
        resolve(file);
      }
    }

    function getFilename (filename) {
      let extname = path.extname(filename);
      return file.fieldname + '-' + Date.now() + extname;
    }

  })
} 
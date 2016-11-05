/**
 * 通用工具库
 */


const validator = require('validator');

/**
 * 过滤查询结果中某个字段相同的数据
 * Callback:
 * 返回过滤后的数据数组   
 * @param {Object || Array} data 查询到的数据
 * @param {String} key 要过滤的字段
 * @param {Number} count 要返回的数据数量，如果为空，则返回全部
 * @returns
 */
exports.filterDataForKey = function (data, key,count) {
  let temp = [];
  let arr = [];
  for(let v of data) {
    if(temp.indexOf(v[key].toString()) === -1) {
      arr.push(v);
      temp.push(v[key].toString());
      if(count && arr.length >= count) {
        break;
      }
    }
  }
  return arr;
}

/**
 * 去除对象所以属性值的前后空格
 * 主要用户接收post数据的处理
 * @param {Object} obj 要处理的对象
 * @returns 处理过的对象
 */
exports.trimObjectValue = function (obj) {
  let temp = {};
  for(let v in obj) {
    temp[v] = validator.trim(obj[v]);
  }
  return temp;
}

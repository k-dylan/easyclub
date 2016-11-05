/**
 * 通用工具库
 */

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


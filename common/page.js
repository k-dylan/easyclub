const config = require('../config');
/**
 * 计算页码
 * - currentPage 当前页码
 * - allPage 总页数
 * - showPageSize 显示页码数
 */
var getPages = exports.get = function (currentPage, allPage, showPageSize) {
  let step = Math.floor(showPageSize / 2);

  let startPage = currentPage - step;
  if(startPage < step) 
    startPage = 1;
  else if (startPage + showPageSize > allPage)
    startPage = allPage - showPageSize + 1;

  let endPage = startPage + showPageSize - 1 > allPage
      ? allPage : startPage + showPageSize - 1;

  return {
    current: currentPage,
    start: startPage,
    end: endPage
  }
}

/**
 * 给Schema添加分页查询方法
 * @param {Object} schema Schema对象
 * @param {String} method 分页查询方法的名称 
 */
exports.addFindPageForQuery = function (schema, method) {
  schema.static(method, findPageForQuery);
}

/**
 * 根据分页获取主题
 * Callback
 * - data {Array} 查询结果
 * - page {Object} 分页信息 开始页码、结束页码
 * @param {Object} query 查询匹配对象
 * @param {String} field 要查询的字段，为null时返回所有字段
 * @param {String} options 其它属性， sort skin limit 等
 * @param {any} current_page 要查询的页码
 * @param {any} pageSize 每页显示的数据条数
 * @param {any} showPageNum 需要在页面上显示的页码数量
 * @returns
 */
async function findPageForQuery (query, field, options, current_page, pageSize, showPageNum) {
  pageSize = pageSize || config.pageSize;
  showPageNum = showPageNum || config.showPageNum;

  let start_item_num = (current_page - 1) * pageSize;
  // 查询总条数
  let count = await this.countQ(query); 
  let all_page_num = Math.ceil(count / pageSize);
  
  let pages = getPages(current_page, all_page_num, showPageNum);

  options = Object.assign(options, {
      skip: start_item_num,
      limit: pageSize
    });
  
  let data =  await this.find(query, field, options);
  return {
    data: data,
    page: pages
  }
}
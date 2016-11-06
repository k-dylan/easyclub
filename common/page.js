
/**
 * 计算页码
 * - currentPage 当前页码
 * - allPage 总页数
 * - showPageSize 显示页码数
 */
exports.get = function (currentPage, allPage, showPageSize) {
  let step = Math.floor(showPageSize / 2);

  let startPage = currentPage - step;
  if(startPage <= step) 
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

/**
 * 计算页码
 * - current_page 当前页码
 * - all_page 总页数
 * - show_page_size 显示页码数
 */
exports.get = function (current_page, all_page, show_page_size) {
  let step = Math.floor(show_page_size / 2);
  
  let start_page = current_page - step <= 0
      ? 1 : current_page - step;
  let end_page = start_page + show_page_size > all_page
      ? all_page : start_page + show_page_size;
      
  return {
    current: current_page,
    start: start_page,
    end: end_page
  }
}
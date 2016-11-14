// tools测试

const should = require('should');
const tools = require('../../common/tools');

describe('common/tools.js', () => {
  let timeAgo = tools.getTimeAgo;
  it('#shold time ago', () => {
    timeAgo(Date.now() - 34000).should.equal('34 秒前');
    timeAgo(Date.now() - 60000 * 34).should.equal('34 分钟前');
    timeAgo(Date.now() - 60000 * 60 * 6).should.equal('6 小时前');
    timeAgo(Date.now() - 60000 * 60 * 26).should.equal('1 天前');
    timeAgo(Date.now() - 60000 * 60 * 24 * 31).should.equal('1 月前');
    timeAgo(Date.now() - 60000 * 60 * 24 * 377).should.equal('1 年前');    
  }); 
})

/**
 * 系统配置文件
 */
const config = {
  // 本地调试模式
  debug: true,
  // 网站名称
  sitename: 'EasyClub',
  // 板块列表
  tags: ['原创', '转载', '提问', '站务'],
  // 每页主题数量
  pageSize: 2, 
  // 显示页码数量
  showPageNum: 5,
  // 数据库连接
  mongodb: {
    username: '',
    password: '',
    host: '127.0.0.1',
    port: 27017,
    database: 'easyclub'
  },
  
}


module.exports = config;
/**
 * 系统配置文件
 */
const config = {
  // 本地调试模式
  debug: true,
  // 网站名称
  sitename: 'EasyClub',
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
/**
 * 系统配置文件
 */
const path = require('path');

const config = {
  // 本地调试模式
  debug: true,
  // 网站名称
  sitename: 'EasyClub',
  // 板块列表
  tags: ['原创', '转载', '提问', '站务'],
  // 论坛管理员，username
  admins: ['dylan'],
  // 每页主题数量
  pageSize: 20, 
  // 积分设置
  score: {
    topic: 5, // 发表一个主题
    reply: 1  // 一个回复
  },
  // 显示页码数量
  showPageNum: 5,
  // 数据库连接
  mongodb: {
    user: '',
    pass: '',
    host: '127.0.0.1',
    port: 27017,
    database: 'easyclub'
  },
  // Redis配置
  redis: {
    host: '127.0.0.1',
    port: 6379
  },
  // 七牛配置信息 
  qiniu: {
    bucket: 'you bucket name',
    accessKey: 'you access key',
    secretKey: 'you secret key',
    origin: 'http://your qiniu domain', 
    // 如果vps在国外，请使用 http://up.qiniug.com/ ，这是七牛的国际节点
    // 如果在国内，此项请留空
    // uploadURL: 'http://xxxxxxxx',
  },
  default_avatar: '/public/images/photo.png', // 默认头像
  
  upload: {
    path: path.join(__dirname, 'public/upload/'),
    url: '/public/upload',
    extnames: ['jpeg', 'jpg', 'gif', 'png'],
    fileSize: 1024 * 1024
  }
}

module.exports = config;
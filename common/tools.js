/**
 * 常用工具函数库
 */


export default {
  /**
   * ajax返回的错误信息对象
   */
  error (msg) {
    return {
      status: 1,
      message: msg
    }
  },
  /**
   * ajax返回成功信息对象
   */
  success (msg) {
    return {
      status: 0,
      message: msg
    }
  }
}
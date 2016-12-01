/**
 * ajax提交插件
 * by: kdylan<kdylan@qq.com>

 */
; (function ($) {
  function loadData (el, options) {
    var $el = this.$el = $(el);
    var $form = this.$form = $el.closest('form');
    options = this.options = $.extend({
      success: function () {},
      before: function () {},
      complete: function () {},
      data: function () {}
    }, options);
    
    // 验证对象
    if(options.data && !$.isFunction(options.data)){
      console.error('options.data 必须为函数，并返回要发送的对象！')
    } 

    this._setOptions('method', options, 'get');
    this._setOptions('action', options);
    this._setOptions('loading', options, '提交中……');
    this.label = $el.text();

    $el.on('complete', options.complete);
    this._bindClick(options);
  }

  loadData.prototype._setOptions = function (key, options, def) {
    var value = options[key]
    if(!value) {
      value = this.$el.data(key);
    }
    if(!value && this.$form) {
      value = this.$form.attr(key);
    }
    if(!value) {
      value = def;
    }
    if(value) {
      this[key] = value;
    } else {
      console.error(key + '不能为空！');
    }
  }

  loadData.prototype._getData = function () {
    var data = this.options.data();
    
    if(!data && this.$form) {
      data = this.$form.serialize();
    }
    return data;
  }

  /**
   * 绑定单击事件
   */
  loadData.prototype._bindClick = function (options) {
    var $el = this.$el
    var _this = this;
    var before = options.before;

    $el.click(function (e) {
        e.preventDefault();
        if(false === before()) {
          return false;
        }

        var data = _this._getData();
        
        $el.attr('disabled', true);
        if(_this.loading)
          $el.text(_this.loading);

        var self = this;
        $.ajax({
          url: _this.action,
          type: _this.method,
          data: data,
          complete: function () {
            $el.attr('disabled', false).text(_this.label);
            $el.trigger('complete', arguments);
          },
          success: function () {
            options.success.apply(self, arguments);
          }
        })
      })
  }

  $.fn.loadData = function (options) {
    if(!this.length) {
      console.warn('jQuery未选择到对象，loadData无法执行！');
      return ;
    } 
    this.each(function () {
      new loadData(this, options);
    })
  }

})(window.jQuery);



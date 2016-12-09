; (function ($) {
  function Modal (el) {
    var mask = this.mask = $('<div class="modal-mask"></div>');
    var el = this.el = el;
    $(el).on('click', '.close', this.hide.bind(this));
  } 
  Modal.prototype._showMask = function () {
    this.mask.appendTo(document.body);
    // 强制 reflow
    this.mask[0].offsetHeight;
    this.mask.addClass('show').one('click', this.hide.bind(this));
  }
  Modal.prototype._hideMask = function () {
    this.mask
      .removeClass('show')
      // 模拟transitonEnd事件,css动画完毕后执行
      .on('delay', function () { $(this).remove(); })
      .delay(200);
  }

  $.fn.delay = function (delay) {
    var _this = this;
    setTimeout(function() {
      _this.trigger('delay');
    }, delay);
  }

  Modal.prototype.show = function () {
    this._showMask();
    $(this.el).show()
    this.el.offsetHeight;
    $(this.el).addClass('show');
  }

  Modal.prototype.hide = function () {
    this._hideMask();
    $(this.el)
      .removeClass('show')
      .on('delay', function () {$(this).hide()})
      .delay(300);
  }

  $.fn.modal = function (action) {
    return this.each(function () {
      var data = $(this).data('modal');
      if(!data) {
        data = new Modal(this);
        $(this).data('modal', data);
      }
      data[action]();
    })
  }
})(window.jQuery)
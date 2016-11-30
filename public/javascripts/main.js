$(function () {


  $(document).on('click.loading', '[data-loading]', function () {
    var $this = $(this);
    var method = $this.is('a, button') ? 'html' : 'val';
    $this[method]($this.data('loading'));
    console.log($this.data('loading'));
  });
});
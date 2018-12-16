var game = new Game();

var blocks = new BlockGenerator();

var rowControls = new NumberLifter('#row');
var colControls = new NumberLifter('#col');

var loader = new ImageLoader(function(info) {
  var image = info.image;
  var size = info.size;
  var row = rowControls.doSuggest(size);
  var col = colControls.doSuggest(size);
  loader.showSnack('加载图片成功，推荐难度:' + row + 'x' + col);
  game.gameProcessControl({
    image: image,
    onBeforeStart: function() {
      var row = rowControls.getNumber();
      var col = colControls.getNumber();
      blocks.generateBlocks(image, size, row, col);
    },
    onStart: function() {
      blocks.disruptBlocks();
      blocks.emitter(game.onSuccess);
    },
    onSuccess: function() {
      console.log('成功');
    }
  });
});
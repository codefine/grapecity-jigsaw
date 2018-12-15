var game = new Game();

var blocks = new BlockGenerator();

var rowControls = new NumberLifter('#row');
var colControls = new NumberLifter('#col');

new ImageLoader(function(info) {
  var image = info.image;
  var size = info.size;
  rowControls.doSuggest(size);
  colControls.doSuggest(size);
  game.gameProcessControl({
    image: image,
    onBeforeStart: function() {
      var row = rowControls.getNumber();
      var col = colControls.getNumber();
      blocks.generateBlocks(image, size, row, col);
    },
    onStart: function() {
      blocks.operationEmitter();
    }
  });
});
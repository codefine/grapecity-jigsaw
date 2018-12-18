// @ts-nocheck

var game = new Game();

var blocks = new BlockGenerator();

var rowControls = new NumberLifter('#row');
var colControls = new NumberLifter('#col');

var loader = new ImageLoader(function(info) {

    var image = info.image;
    var size = info.size;
    var row = rowControls.doSuggest(size);
    var col = colControls.doSuggest(size);

    loader.showSnack('加载图片成功，推荐难度:' + row + 'x' + col, 3000);

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
            loader.showSnack('计时开始');
        },
        onSuccess: function() {},
        onGiveup: function() {
            blocks.showBackground();
        }
    });
    
});

console.log('Author: Michael.Lu', 'Email: 277133779@qq.com');
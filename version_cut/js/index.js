// @ts-nocheck

var game = new Game();

var blocks = new BlockGenerator();

var rowControls = new NumberLifter('#row');
var colControls = new NumberLifter('#col');

var loader = new ImageLoader(function() {

    var row = rowControls.getNumber();
    var col = colControls.getNumber();
    var info = loader.updateDrawing(row, col);

    rowControls.onChange = function() {
        loader.reset();
        var row = rowControls.getNumber();
        var col = colControls.getNumber();
        loader.updateDrawing(row, col);
    };
    colControls.onChange = function() {
        loader.reset();
        var row = rowControls.getNumber();
        var col = colControls.getNumber();
        loader.updateDrawing(row, col);
    };

    loader.showSnack('拖拽图片至理想位置，开始游戏', 3000);

    game.gameProcessControl({
        image: info.image,
        onBeforeStart: function() {
            var row = rowControls.getNumber();
            var col = colControls.getNumber();
            var info = loader.updateDrawing(row, col, true);
            blocks.generateBlocks(info.image, info.size, row, col);
        },
        onStart: function() {
            blocks.disruptBlocks();
            blocks.emitter(game.onSuccess);
            loader.showSnack('计时开始');
        },
        onSuccess: function() {
            loader.reset();
        },
        onGiveup: function() {
            loader.reset();
            blocks.showBackground();
        }
    });
    
});

console.log('%c Michael.Lu ', 'background:#313131;color:#bada55');
console.log('%c277133779@qq.com', 'color:#F52402');
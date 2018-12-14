var rowControls = new NumberLifter('#row');
var colControls = new NumberLifter('#col');

new ImageLoader(function(info) {
    var image = info.image;
    var size = info.size;
    rowControls.doSuggest(size);
    colControls.doSuggest(size);
});
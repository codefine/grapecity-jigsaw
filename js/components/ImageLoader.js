// @ts-nocheck

function ImageLoader(callback) {
    if (typeof callback === 'function') {
        this.callback = callback;
    }
    this.init();
    this.addListeners();
}

ImageLoader.prototype.init = function() {
    this.area = document.querySelector('#area');
    this.playground = document.querySelector('#playground');
    this.button = document.querySelector('#upload-button');
    this.input = document.querySelector('#upload-control');
    this.canvas = document.createElement('canvas');
    this.canvasCtx = this.canvas.getContext('2d');
    this.reader = new FileReader();
    this.image = new Image();
};

ImageLoader.prototype.addListeners = function() {
    const THIS = this;
    this.button.addEventListener('click', function() {
        THIS.input.click();
    });
    this.reader.addEventListener('load', function(event) {
        THIS.image.src = event.target.result;
    });
    this.input.addEventListener('change', function(event) {
        var file = event.target.files[0];
        if (file.type.includes('image')) {
            THIS.reader.readAsDataURL(file);
        }
    });
    this.image.addEventListener('load', () => {
        var originWidth = THIS.image.width;
        var originHeight = THIS.image.height;
        var size = THIS.resizeImage(originWidth, originHeight);
        var drawing = THIS.drawImage(size[0], size[1]);
        THIS.updateDrawing(drawing, size);
    });
};

ImageLoader.prototype.resizeImage = function(width, height) {
    var padding = 20;
    var maxWidth = this.area.clientWidth - padding;
    var maxHeight = this.area.clientHeight - padding;
    var targetWidth = width;
    var targetHeight = height;
    // if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
            targetWidth = maxWidth;
            targetHeight = Math.round(maxWidth * (height / width));
        } else {
            targetHeight = maxHeight;
            targetWidth = Math.round(maxHeight * (width / height));
        }
    // } else {

    // }
    return [targetWidth, targetHeight];
}

ImageLoader.prototype.drawImage = function(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvasCtx.clearRect(0, 0, width, height);
    this.canvasCtx.drawImage(this.image, 0, 0, width, height);
    return this.canvas.toDataURL('image/jpeg');
}

ImageLoader.prototype.updateDrawing = function(drawing, size) {
    this.playground.style.backgroundImage = 'url(' + drawing + ')';
    this.playground.style.width = size[0] + 'px';
    this.playground.style.height = size[1] + 'px';
    this.callback && this.callback({
        image: drawing,
        size: size
    });
}
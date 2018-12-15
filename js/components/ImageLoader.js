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
    this.background = document.querySelector('#background');
    this.playground = document.querySelector('#playground');
    this.button = document.querySelector('#upload-button');
    this.input = document.querySelector('#upload-control');
    this.snack = document.querySelector('.snackbar');
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
            THIS.showSnack('加载图片成功');
        } else {
            THIS.showSnack('上传仅支持图片类型文件');
        }
    });
    this.image.addEventListener('load', () => {
        var originWidth = THIS.image.width;
        var originHeight = THIS.image.height;
        var size = THIS.resizeImage(originWidth, originHeight);
        var drawing = THIS.getDrawing(size[0], size[1]);
        THIS.updateDrawing(drawing, size);
    });
};

ImageLoader.prototype.resizeImage = function(width, height) {
    var padding = 20;
    var maxWidth = this.area.clientWidth - padding;
    var maxHeight = this.area.clientHeight - padding;
    var targetWidth = width;
    var targetHeight = height;
    if (width / height > maxWidth / maxHeight) {
        targetWidth = maxWidth;
        targetHeight = Math.round(maxWidth * (height / width));
    } else {
        targetHeight = maxHeight;
        targetWidth = Math.round(maxHeight * (width / height));
    }
    return [targetWidth, targetHeight];
};

ImageLoader.prototype.getDrawing = function(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvasCtx.clearRect(0, 0, width, height);
    this.canvasCtx.drawImage(this.image, 0, 0, width, height);
    return this.canvas.toDataURL('image/jpeg');
};

ImageLoader.prototype.updatePlaygroundStyles = function(drawing, size) {
    this.background.style.backgroundImage = 'url(' + drawing + ')';
    this.background.style.width = size[0] + 'px';
    this.background.style.height = size[1] + 'px';
    this.playground.style.width = size[0] + 'px';
    this.playground.style.height = size[1] + 'px';
};

ImageLoader.prototype.updateDrawing = function(drawing, size) {
    this.updatePlaygroundStyles(drawing, size);
    this.callback && this.callback({
        image: drawing,
        size: size
    });
};

ImageLoader.prototype.showSnack = function(content) {
    var THIS = this;
    this.snack.innerHTML = content;
    this.snack.classList.add('_show');
    clearTimeout(this.snack.timer);
    this.snack.timer = setTimeout(function() {
        THIS.snack.classList.remove('_show');
    }, 2000);
};
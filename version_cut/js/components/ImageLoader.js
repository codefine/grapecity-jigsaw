// @ts-nocheck

function ImageLoader(callback) {
    if (typeof callback === 'function') {
        this.callback = callback;
    }
    this.init();
    this.addListeners();
    this.dragToCut();
}

ImageLoader.prototype.init = function() {
    this.area = document.querySelector('#area');
    this.background = document.querySelector('#background');
    this.playground = document.querySelector('#playground');
    this.mask = document.querySelector('.mask');
    this.layer = document.querySelector('.layer');
    this.uploadBtn = document.querySelector('#upload-button');
    this.recutBtn = document.querySelector('#recut-button');
    this.startBtn = document.querySelector('#start');
    this.input = document.querySelector('#upload-control');
    this.snack = document.querySelector('.snackbar');
    this.canvas = document.createElement('canvas');
    this.canvasCtx = this.canvas.getContext('2d');
    this.reader = new FileReader();
    this.image = new Image();
};

ImageLoader.prototype.addListeners = function() {
    const THIS = this;
    this.uploadBtn.addEventListener('click', function() {
        THIS.input.setAttribute('type', 'file');
        THIS.input.click();
    });
    this.recutBtn.addEventListener('click', function() {
        THIS.updateDrawing(THIS.row, THIS.col);
    });
    this.reader.addEventListener('load', function(event) {
        THIS.image.src = event.target.result;
    });
    this.input.addEventListener('change', function(event) {
        var file = event.target.files[0];
        if (file.type.includes('image')) {
            THIS.reader.readAsDataURL(file);
        } else {
            THIS.showSnack('上传仅支持图片类型文件');
        }
        THIS.input.setAttribute('type', 'text');
    });
    this.image.addEventListener('load', function() {
        THIS.callback && THIS.callback();
    });
};

ImageLoader.prototype.dragToCut = function() {
    var THIS = this;
    var beginX = null;
    var beginY = null;
    var originPosition = null;
    var info = null;
    this.area.addEventListener('mousedown', function(event) {
        if (event.target.classList.contains('background') || event.target.classList.contains('playground')) {
            THIS.background.classList.add('_dragging');
            beginX = event.clientX;
            beginY = event.clientY;
            originPosition = [THIS.background.offsetLeft, THIS.background.offsetTop];
            info = THIS.getComputedInfo(THIS.row, THIS.col);
        }
    });
    document.body.addEventListener('mousemove', function(event) {
        event.preventDefault();
        if (originPosition) {
            var currentX = event.clientX;
            var currentY = event.clientY;
            var disX = currentX - beginX;
            var disY = currentY - beginY;
            var targetPosition = [originPosition[0] + disX, originPosition[1] + disY];
            THIS.moveDrawing(targetPosition, info);
        }
    });
    document.body.addEventListener('mouseup', function(event) {
        event.preventDefault();
        THIS.background.classList.remove('_dragging');
        beginX = null;
        beginY = null;
        originPosition = null;
        info = null;
    });
  };

ImageLoader.prototype.getComputedInfo = function(row, col) {
    var padding = 20;
    var maxWidth = this.area.clientWidth - padding;
    var maxHeight = this.area.clientHeight - padding;
    var imageWidth = 0;
    var imageHeight = 0;
    var playgroundWidth = 0;
    var playgroundHeight = 0;
    var direction = null;
    
    // 根据行列关系确定游戏区域在容器范围内的最大尺寸
    if (row > col) {
        playgroundHeight = maxHeight;
        playgroundWidth = col * maxHeight / row;
    } else if (row < col) {
        playgroundWidth = maxWidth;
        playgroundHeight = row * maxWidth / col;
    } else {
        playgroundWidth = maxWidth;
        playgroundHeight = maxHeight;
    }

    // 根据游戏区域尺寸确定图片最大尺寸
    if (playgroundWidth / playgroundHeight > this.image.width / this.image.height) {
        imageWidth = playgroundWidth;
        imageHeight = playgroundWidth * (this.image.height / this.image.width);
    } else if (playgroundWidth / playgroundHeight < this.image.width / this.image.height) {
        imageHeight = playgroundHeight;
        imageWidth = playgroundHeight * (this.image.width / this.image.height);
    } else {
        imageWidth = playgroundWidth;
        imageHeight = playgroundHeight;
    }

    // 分别比较游戏区域以及图片的长宽，确定可拖拽的方向
    if (playgroundWidth < imageWidth && playgroundHeight === imageHeight) {
        direction = 'x';
    } else if (playgroundWidth === imageWidth && playgroundHeight < imageHeight) {
        direction = 'y';
    } else {
        direction = null;
    }
    return {
        background: [imageWidth, imageHeight],
        playground: [playgroundWidth, playgroundHeight],
        direction: direction
    };
};

ImageLoader.prototype.moveDrawing = function(position, info) {
    var center = [this.area.clientWidth / 2, this.area.clientHeight / 2];
    var direction = info.direction;
    // 最大拖拽距离限制
    if (direction === 'x') {
        var x = position[0];
        var rangeLeft = center[0] - (info.background[0] - info.playground[0]) / 2;
        var rangeRight = center[0] + (info.background[0] - info.playground[0]) / 2;
        x < rangeLeft && (x = rangeLeft);
        x > rangeRight && (x = rangeRight);
        this.background.style.left = x + 'px';
    } else if (direction === 'y') {
        var y = position[1];
        var rangeTop = center[1] - (info.background[1] - info.playground[1]) / 2;
        var rangeBottom = center[1] + (info.background[1] - info.playground[1]) / 2;
        y < rangeTop && (y = rangeTop);
        y > rangeBottom && (y = rangeBottom);
        this.background.style.top = y + 'px';
    }
};

ImageLoader.prototype.getCutPosition = function(info) {
    // 计算游戏区域相对于拖拽后图片区域的位置
    var backgroundSize = info.background;
    var playgroundSize = info.playground;
    var backgroundPosition = [this.background.offsetLeft, this.background.offsetTop];
    var playgroundPosition = [this.playground.offsetLeft, this.playground.offsetTop];
    var cutX = backgroundPosition[0] - backgroundSize[0] / 2 - (playgroundPosition[0] - playgroundSize[0] / 2);
    var cutY = backgroundPosition[1] - backgroundSize[1] / 2 - (playgroundPosition[1] - playgroundSize[1] / 2);
    return [cutX, cutY];
};

ImageLoader.prototype.getDrawing = function(size, cutPosition) {
    this.canvas.width = size[0];
    this.canvas.height = size[1];
    this.canvasCtx.clearRect(0, 0, size[0], size[1]);
    this.canvasCtx.drawImage(this.image, cutPosition[0], cutPosition[1], size[0], size[1]);
    return this.canvas.toDataURL('image/jpeg');
};

ImageLoader.prototype.updatePlaygroundStyles = function(drawing, size, cut) {
    this.background.style.backgroundImage = 'url(' + drawing + ')';
    this.background.style.width = (cut ? size.playground[0] : size.background[0]) + 'px';
    this.background.style.height = (cut ? size.playground[1] : size.background[1]) + 'px';
    this.playground.style.width = size.playground[0] + 'px';
    this.playground.style.height = size.playground[1] + 'px';
    cut && this.reset();
};

ImageLoader.prototype.reset = function() {
    this.playground.innerHTML = '';
    this.background.style.left = this.playground.style.left;
    this.background.style.top = this.playground.style.top;
};

ImageLoader.prototype.updateDrawing = function(row, col, cut) {
    this.row = row;
    this.col = col;
    this.mask.classList.add('_hide');
    this.layer.classList.add('_hide');
    this.startBtn.classList.remove('_disabled');
    if (cut) {
        this.area.classList.remove('_hideOverflow');
    } else {
        this.area.classList.add('_hideOverflow');
    }
    var info = this.getComputedInfo(row, col);
    if (cut) {
        this.playground.classList.remove('_beforeStart');
        var cutPosition = this.getCutPosition(info);
        var drawing = this.getDrawing(info.background, cutPosition);
        this.updatePlaygroundStyles(drawing, info, cut);
        return {
            image: drawing,
            row: row,
            col: col,
            size: info.playground
        };
    } else {
        this.playground.classList.add('_beforeStart');
        var cutPosition = [0, 0];
        var drawing = this.getDrawing(info.background, cutPosition);
        this.updatePlaygroundStyles(drawing, info);
        return {
            image: drawing
        };
    }
};

ImageLoader.prototype.showSnack = function(content, time) {
    time = typeof time === 'number' ? time : 2000;
    var THIS = this;
    this.snack.innerHTML = content;
    this.snack.classList.add('_show');
    clearTimeout(this.snack.timer);
    this.snack.timer = setTimeout(function() {
        THIS.snack.classList.remove('_show');
    }, time);
};
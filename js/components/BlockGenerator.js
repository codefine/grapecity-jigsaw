// @ts-nocheck

function BlockGenerator() {
  this.dragging = false;
  this.init();
  this.initOperations();
}

BlockGenerator.prototype.init = function() {
  this.container = document.querySelector('#playground');
};

BlockGenerator.prototype.createABlock = function(image, width, height, col, index) {
  var THIS = this;
  var left = width * (index % col);
  var top = height * Math.floor(index / col);
  var block = document.createElement('div');
  block.classList.add('block');
  block.style.width = width + 'px';
  block.style.height = height + 'px';
  block.style.backgroundImage = 'url(' + image + ')';
  block.style.backgroundPosition = String(-left) + 'px ' + String(-top) + 'px';
  block.style.transform = 'translate(' + left + 'px, ' + top + 'px)';
  block.addEventListener('mouseenter', function() {
    if (THIS.dragging) return;
    block.style.transform = 'translate(' + left + 'px, ' + top + 'px) scale(1.1)';
    block.style.zIndex = 2;
  });
  block.addEventListener('mouseleave', function() {
    if (THIS.dragging) return;
    block.style.transform = 'translate(' + left + 'px, ' + top + 'px)';
    block.style.zIndex = 1;
  });
  return block;
};

BlockGenerator.prototype.generateBlocks = function(image, size, row, col) {
  var blockWidth = size[0] / col;
  var blockHeight = size[1] / row;
  var total = row * col;
  for (var i = 0; i < total; i ++) {
    var block = this.createABlock(image, blockWidth, blockHeight, col, i);
    this.container.appendChild(block);
  }
};

BlockGenerator.prototype.initOperations = function() {
  var THIS = this;
  var beginX = 0;
  var beginY = 0;
  var lastBlock = null;
  var originTranslate = [0, 0];
  this.container.addEventListener('mousedown', function(event) {
    if (event.target.classList.contains('block')) {
      beginX = event.clientX;
      beginY = event.clientY;
      lastBlock = event.target;
      originTranslate = THIS.getTranslate(event.target);
    }
  });
  document.body.addEventListener('mousemove', function(event) {
    if (!lastBlock) return;
    var currentX = event.clientX;
    var currentY = event.clientY;
    var disX = currentX - beginX;
    var disY = currentY - beginY;
    if (Math.abs(disX) >= 1 || Math.abs(disY) >= 1) {
      THIS.dragging = true;
      lastBlock.classList.add('dragging');
      THIS.drag(lastBlock, originTranslate, [disX, disY]);
    } else {
      THIS.dragging = false;
    }
  });
  document.body.addEventListener('mouseup', function(event) {
    if (!lastBlock) return;
    event.preventDefault();
    var endX = event.clientX;
    var endY = event.clientY;
    var disX = endX - beginX;
    var disY = endY - beginY;
    if (!THIS.dragging) {
      THIS.rotate();
    }
    lastBlock.classList.remove('dragging');
    lastBlock = null;
    originTranslate = [0, 0];
    THIS.dragging = false;
  });
};

BlockGenerator.prototype.drag = function(target, origin, vec2) {
  var targetX = String(origin[0] + vec2[0]);
  var targetY = String(origin[1] + vec2[1]);
  var transform = 'translate(' + targetX + 'px, ' + targetY + 'px) scale(1.1)';
  target.style.transform = transform;
};

BlockGenerator.prototype.rotate = function() {
  console.log('旋转');
};

BlockGenerator.prototype.getTranslate = function(target) {
  var reg = /translate\((\d+(\.\d+)?)px\,\s*(\d+(\.\d+)?)px\)/;
  var matches = target.style.transform.match(reg);
  return [parseFloat(matches[1]), parseFloat(matches[3])];
};

BlockGenerator.prototype.operationEmitter = function() {
  console.log('进行了操作');
};
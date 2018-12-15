// @ts-nocheck

function BlockGenerator() {
  this.init();
  this.initOperations();
}

BlockGenerator.prototype.init = function() {
  this.dragging = false;
  this.replacedId = null;
  this.state = [];
  this.container = document.querySelector('#playground');
};

BlockGenerator.prototype.generateBlockState = function(block, id, width, height, left, top, rotation) {
  this.state.push({
    el: block,
    id: id,
    w: width,
    h: height,
    l: left,
    t: top,
    lt: [left - width / 2, top - height / 2],
    rb: [left + width / 2, top + height / 2],
    r: rotation,
  });
};

BlockGenerator.prototype.getBlockState = function(id) {
  for (var i = 0; i < this.state.length; i ++) {
    var target = this.state[i];
    if (id === target.id) {
      return target;
    }
  }
};

BlockGenerator.prototype.updateBlockState = function(id, state) {
  for (var i = 0; i < this.state.length; i ++) {
    var target = this.state[i];
    if (id === target.id) {
      typeof state.l === 'number' && (target.l = state.l);
      typeof state.t === 'number' && (target.t = state.t);
      typeof state.r === 'number' && (target.r = state.r);
      if (typeof state.l === 'number' && typeof state.t === 'number') {
        target.lt = [state.l - target.w / 2, state.t - target.h / 2];
        target.rb = [state.l + target.w / 2, state.t + target.h / 2];
      }
      break;
    }
  }
};

BlockGenerator.prototype.createABlock = function(image, width, height, col, index) {
  var THIS = this;
  var left = width * (index % col);
  var top = height * Math.floor(index / col);
  var rotation = [0, 90, 270][Math.floor(Math.random() * 3)];
  var block = document.createElement('div');
  block.id = 'block-' + index;
  block.classList.add('block');
  block.style.width = width + 'px';
  block.style.height = height + 'px';
  block.style.backgroundImage = 'url(' + image + ')';
  block.style.backgroundPosition = String(-left) + 'px ' + String(-top) + 'px';
  block.style.transform = 'translate(' + left + 'px, ' + top + 'px) rotate(' + rotation + 'deg)';
  block.addEventListener('mouseenter', function() {
    if (THIS.dragging) return;
    var blockState = THIS.getBlockState(index);
    block.style.transform = 'translate(' + blockState.l + 'px, ' + blockState.t + 'px) rotate(' + blockState.r + 'deg) scale(1.1)';
    block.style.zIndex = 3;
  });
  block.addEventListener('mouseleave', function() {
    if (THIS.dragging) return;
    var blockState = THIS.getBlockState(index);
    block.style.transform = 'translate(' + blockState.l + 'px, ' + blockState.t + 'px) rotate(' + blockState.r + 'deg)';
    block.style.zIndex = 1;
  });
  this.generateBlockState(block, index, width, height, left, top, rotation);
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
  var beginX = null;
  var beginY = null;
  var lastBlock = null;
  var lastBlockId = null;
  var lastBlockState = {};
  this.container.addEventListener('mousedown', function(event) {
    if (event.target.classList.contains('block')) {
      beginX = event.clientX;
      beginY = event.clientY;
      lastBlock = event.target;
      lastBlockId = Number(lastBlock.id.split('-')[1]);
      lastBlockState = THIS.getBlockState(lastBlockId);
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
      lastBlock.classList.add('_dragging');
      var targetX = lastBlockState.l + disX;
      var targetY = lastBlockState.t + disY;
      THIS.moveBlock(lastBlock, [targetX, targetY], lastBlockState.r, true);
      THIS.showReplaceable(lastBlockId, [targetX, targetY]);
    } else {
      THIS.dragging = false;
    }
  });
  document.body.addEventListener('mouseup', function(event) {
    if (!lastBlock) return;
    event.preventDefault();
    if (THIS.dragging) {
      if (typeof THIS.replacedId === 'number') {
        var replacedBlockState = THIS.getBlockState(THIS.replacedId);
        THIS.change2BlocksPosition(lastBlockState, replacedBlockState);
        replacedBlockState.el.classList.remove('_action');
      } else {
        THIS.moveBlock(lastBlock, [lastBlockState.l, lastBlockState.t], lastBlockState.r);
      }
    } else {
      THIS.rotate();
    }
    lastBlock.classList.remove('_dragging');
    lastBlock = null;
    lastBlockId = null;
    THIS.dragging = false;
    THIS.replacedId = null;
  });
};

BlockGenerator.prototype.moveBlock = function(target, position, rotation, isHover) {
  var scale = isHover ? ' scale(1.1)' : '';
  var transform = 'translate(' + position[0] + 'px, ' + position[1] + 'px) rotate(' + rotation + 'deg)' + scale;
  target.style.transform = transform;
};

BlockGenerator.prototype.showReplaceable = function(id, position) {
  for (var i = 0; i < this.state.length; i ++) {
    this.state[i].el.classList.remove('_action');
    this.replacedId = null;
  }
  for (var i = 0; i < this.state.length; i ++) {
    var target = this.state[i];
    if (target.id === id) continue;
    var lt = target.lt;
    var rb = target.rb;
    if (position[0] > lt[0] && position[0] < rb[0] && position[1] > lt[1] && position[1] < rb[1]) {
      target.el.classList.add('_action');
      this.replacedId = target.id;
      break;
    }
  }
};

BlockGenerator.prototype.change2BlocksPosition = function(draggedState, replacedState) {
  var draggedBlock = draggedState.el;
  var replacedBlock = replacedState.el;
  var originPosition = [draggedState.l, draggedState.t];
  var targetPosition = [replacedState.l, replacedState.t];
  var draggedRotation = draggedState.r;
  var replacedRotation = replacedState.r;
  replacedBlock.style.zIndex = 2;
  this.moveBlock(draggedBlock, targetPosition, draggedRotation);
  this.moveBlock(replacedBlock, originPosition, replacedRotation);
  this.updateBlockState(draggedState.id, { l: targetPosition[0], t: targetPosition[1] });
  this.updateBlockState(replacedState.id, { l: originPosition[0], t: originPosition[1] });
};

BlockGenerator.prototype.rotate = function() {
  console.log('旋转');
  console.log(this.state);
};

// BlockGenerator.prototype.getTranslate = function(target) {
//   var reg = /translate\((\d+(\.\d+)?)px\,\s*(\d+(\.\d+)?)px\)/;
//   var matches = target.style.transform.match(reg);
//   return [parseFloat(matches[1]), parseFloat(matches[3])];
// };

// BlockGenerator.prototype.getRotation = function(target) {
//   var reg = /rotate\((-?\d+)deg\)/;
//   var matches = target.style.transform.match(reg);
//   return Number(matches[1]);
// };

BlockGenerator.prototype.operationEmitter = function() {
  console.log('进行了操作');
};
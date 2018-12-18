// @ts-nocheck

function BlockGenerator() {
  this.init();
  this.initRotationHelper();
  this.initPositionHelper();
  this.addListeners();
  this.initOperations();
}

BlockGenerator.prototype.init = function() {
  this.dragging = false;
  this.replacedId = null;
  this.state = [];
  this.container = document.querySelector('#playground');
  this.background = document.querySelector('#background');
  this.hint = document.querySelector('#hint');
};

BlockGenerator.prototype.initRotationHelper = function() {
  this.rotationHelper = document.createElement('div');
  this.rotationHelper.classList.add('rotation-helper');
  this.lastRotationHelped = null;
};

BlockGenerator.prototype.addRotationHelper = function(error) {
  var targetState = this.state[error.index];
  targetState.el.appendChild(this.rotationHelper);
  this.lastRotationHelped = targetState.el;
};

BlockGenerator.prototype.removeRotationHelper = function() {
  this.lastRotationHelped && this.lastRotationHelped.removeChild(this.rotationHelper);
  this.lastRotationHelped = null;
};

BlockGenerator.prototype.initPositionHelper = function() {
  this.positionHelper = document.createElement('div');
  this.positionHelper.classList.add('position-helper');
  this.positionHelperShow = false;
  var leftPoint = document.createElement('span');
  leftPoint.classList.add('leftPoint');
  this.positionHelper.appendChild(leftPoint);
  var rightPoint = document.createElement('span');
  rightPoint.classList.add('rightPoint');
  this.positionHelper.appendChild(rightPoint);
};

BlockGenerator.prototype.addPositionHelper = function(error) {
  this.positionHelperShow = true;
  this.container.appendChild(this.positionHelper);
  var originState = this.state[error.id];
  var targetState = this.state[error.index];
  var originPosition = [originState.l, originState.t];
  var targetPosition = [targetState.l, targetState.t];
  var disX = targetPosition[0] - originPosition[0];
  var disY = targetPosition[1] - originPosition[1];
  var helperLength = Math.sqrt( disX * disX + disY * disY );
  var helperRotation = Math.atan(disY / disX) * 180 / Math.PI;
  var helperPosition = targetPosition[0] < originPosition[0] ? targetPosition : originPosition;
  this.positionHelper.style.width = helperLength + 'px';
  this.positionHelper.style.left = helperPosition[0] + targetState.w / 2 + 'px';
  this.positionHelper.style.top = helperPosition[1] + targetState.h / 2 + 'px';
  this.positionHelper.style.transform = 'rotate(' + helperRotation + 'deg)';
};

BlockGenerator.prototype.removePositionHelper = function() {
  this.positionHelperShow && this.container.removeChild(this.positionHelper);
  this.positionHelperShow = false;
};

BlockGenerator.prototype.addListeners = function() {
  var THIS = this;
  this.hint.addEventListener('click', function() {
    THIS.doHelp();
  });
};

BlockGenerator.prototype.doHelp = function() {
  var error = this.check();
  if (error.type === 'rotation') {
    this.addRotationHelper(error);
  } else if (error.type === 'position') {
    this.addPositionHelper(error);
  }
  console.log(error);
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

BlockGenerator.prototype.swapBlockState = function(id1, id2) {
  var index1 = this.state.findIndex(function(block) { return block.id === id1 });
  var index2 = this.state.findIndex(function(block) { return block.id === id2 });
  this.state[index1] = this.state.splice(index2, 1, this.state[index1])[0];
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
  var rotation = 0;
  var block = document.createElement('div');
  block.id = 'block-' + index;
  block.classList.add('block', '_start');
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
  this.clearBlocks();
  this.background.classList.remove('_bright');
  var blockWidth = size[0] / col;
  var blockHeight = size[1] / row;
  var total = row * col;
  var fragment = document.createDocumentFragment();
  for (var i = 0; i < total; i ++) {
    var block = this.createABlock(image, blockWidth, blockHeight, col, i);
    fragment.appendChild(block);
  }
  this.container.appendChild(fragment);
};

BlockGenerator.prototype.clearBlocks = function(image, size, row, col) {
  this.container.innerHTML = '';
  this.state = [];
};

BlockGenerator.prototype.disruptBlocks = function() {
  var THIS = this;
  var orderPositions = this.state.map(function(block) {
    return { l: block.l, t: block.t };
  });
  this.state.sort(function(a, b) {
    return Math.random()>.5 ? -1 : 1;
  });
  this.state.forEach(function(block, i) {
    var position = [orderPositions[i].l, orderPositions[i].t];
    var rotation = [0, 180][Math.round(Math.random())];
    THIS.moveBlock(block.el, position, rotation);
    THIS.updateBlockState(block.id, { l: position[0], t: position[1], r: rotation });
  });
  this.check(function() {
    THIS.disruptBlocks();
  });
};

BlockGenerator.prototype.initOperations = function() {
  var THIS = this;
  var beginX = null;
  var beginY = null;
  var lastBlock = null;
  var lastBlockId = null;
  var lastBlockState = {};
  this.container.addEventListener('mousedown', function(event) {
    var target = event.target;
    if (target.classList.contains('rotation-helper')) {
      target = target.parentNode;
    }
    if (target.classList.contains('block')) {
      beginX = event.clientX;
      beginY = event.clientY;
      lastBlock = target;
      lastBlockId = Number(lastBlock.id.split('-')[1]);
      lastBlockState = THIS.getBlockState(lastBlockId);
    }
  });
  document.body.addEventListener('mousemove', function(event) {
    if (!lastBlock) return;
    event.preventDefault();
    var currentX = event.clientX;
    var currentY = event.clientY;
    var disX = currentX - beginX;
    var disY = currentY - beginY;
    if (Math.abs(disX) >= 3 || Math.abs(disY) >= 3) {
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
        THIS.swapBlocks(lastBlockState, replacedBlockState);
        replacedBlockState.el.classList.remove('_action');
      } else {
        THIS.moveBlock(lastBlock, [lastBlockState.l, lastBlockState.t], lastBlockState.r);
      }
    } else {
      THIS.rotate(lastBlockState);
    }
    THIS.check();
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
  var THIS = this;
  this.state.forEach(function(block) {
    block.el.classList.remove('_action');
    THIS.replacedId = null;
  });
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

BlockGenerator.prototype.swapBlocks = function(draggedState, replacedState) {
  var draggedBlock = draggedState.el;
  var replacedBlock = replacedState.el;
  var originPosition = [draggedState.l, draggedState.t];
  var targetPosition = [replacedState.l, replacedState.t];
  var draggedRotation = draggedState.r;
  var replacedRotation = replacedState.r;
  replacedBlock.style.zIndex = 2;
  this.swapBlockState(draggedState.id, replacedState.id);
  this.moveBlock(draggedBlock, targetPosition, draggedRotation);
  this.moveBlock(replacedBlock, originPosition, replacedRotation);
  this.updateBlockState(draggedState.id, { l: targetPosition[0], t: targetPosition[1] });
  this.updateBlockState(replacedState.id, { l: originPosition[0], t: originPosition[1] });
};

BlockGenerator.prototype.rotate = function(block) {
  var rotation = block.r === 180 ? 0 : 180;
  this.updateBlockState(block.id, { r: rotation });
  this.moveBlock(block.el, [block.l, block.t], rotation, true);
};

BlockGenerator.prototype.check = function(redo) {
  var THIS = this;
  this.removeRotationHelper();
  this.removePositionHelper();
  var error = {
    index: 0,
    id: null,
    type: null
  };
  for (var i = 0; i < this.state.length; i ++) {
    var block = this.state[i];
    var idOrdered = block.id === i;
    var rotationOrdered = block.r % 360 === 0;
    if (!rotationOrdered || !idOrdered) {
      error.id = block.id;
      error.type = !rotationOrdered ? 'rotation' : ( !idOrdered ? 'position' : null );
      error.index = i;
      break;
    }
  }
  if (i === this.state.length) {
    if (redo) {
      redo();
    } else {
      THIS.callback && THIS.callback();
    }
  } else {
    return error;
  }
};

BlockGenerator.prototype.showBackground = function() {
  this.background.classList.add('_bright');
  this.state.forEach(function(block) {
    block.el.classList.remove('_start');
  });
};

BlockGenerator.prototype.emitter = function(callback) {
  var THIS = this;
  this.callback = function() {
    THIS.showBackground();
    setTimeout(function() {
      callback();
    }, 800);
  };
};
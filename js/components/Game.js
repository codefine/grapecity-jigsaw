// @ts-nocheck

function Game() {
  this.init();
  this.addListeners();
  this.gameProcessControl();
}

Game.prototype.init = function() {
  this.container = document.querySelector('.container');
  this.header = document.querySelector('#header');
  this.panel = document.querySelector('#panel');
  this.mask = this.container.querySelector('.mask');
  this.layer = this.container.querySelector('.layer');
  this.intro = this.layer.querySelector('.intro');
  this.timer = this.layer.querySelector('.timer');
  this.win = this.layer.querySelector('.win');
  this.uploadBtn = this.layer.querySelector('.upload');
  this.recutBtn = this.layer.querySelector('.recut');
  this.startBtn = document.querySelector('#start');
  this.giveupBtn = document.querySelector('#giveup');
  this.hintBtn = document.querySelector('#hint');
  this.clock = 0;
};

Game.prototype.addListeners = function() {
  var THIS = this;
  this.startBtn.addEventListener('click', function() {
    if (this.classList.contains('_disabled')) return;
    THIS.start();
  });
  this.giveupBtn.addEventListener('click', function() {
    THIS.giveup();
  });
};

Game.prototype.gameProcessControl = function(info) {
  var THIS = this;
  if (!info) {
    this.startBtn.classList.add('_disabled');
    return;
  }
  if (info.image) {
    this.startBtn.classList.remove('_disabled');
  }
  if (typeof info.onBeforeStart === 'function') {
    this.onBeforeStart = info.onBeforeStart;
  }
  if (typeof info.onStart === 'function') {
    this.onStart = info.onStart;
  }
  if (typeof info.onGiveup === 'function') {
    this.onGiveup = info.onGiveup;
  }
  if (typeof info.onSuccess === 'function') {
    this.onSuccess = function() {
      var time = THIS.getPassedTime();
      info.onSuccess(time);
      THIS.success();
    };
  }
};

Game.prototype.getPassedTime = function() {
  var now = Date.now();
  var time = parseFloat(((now - this.clock) / 1000).toFixed(2));
  return time;
};

Game.prototype.start = function() {
  var THIS = this;
  this.header.classList.add('_start');
  this.panel.classList.add('_start');
  this.container.classList.add('_start');
  THIS.onBeforeStart && THIS.onBeforeStart();
  clearTimeout(this.startBtn.timer);
  this.startBtn.timer = setTimeout(function() {
    THIS.mask.classList.add('_hide');
    THIS.layer.classList.add('_hide');
    THIS.giveupBtn.classList.add('_show');
    THIS.hintBtn.classList.add('_show');
    THIS.onStart && THIS.onStart();
    THIS.clock = Date.now();
  }, 800);
};

Game.prototype.success = function() {
  var THIS = this;
  this.mask.classList.remove('_hide');
  this.layer.classList.remove('_hide');
  this.giveupBtn.classList.remove('_show');
  this.hintBtn.classList.remove('_show');
  this.win.classList.remove('_hide');
  this.intro.classList.add('_hide');
  this.uploadBtn.classList.add('_hide');
  this.recutBtn.classList.add('_hide');
  this.timer.classList.remove('_hide');
  this.timer.innerHTML = '耗时: ' + this.getPassedTime() + '秒';
  clearTimeout(this.startBtn.timer);
  THIS.startBtn.timer = setTimeout(function() {
    THIS.header.classList.remove('_start');
    THIS.panel.classList.remove('_start');
    THIS.container.classList.remove('_start');
    THIS.uploadBtn.classList.remove('_hide');
    THIS.recutBtn.classList.remove('_hide');
    THIS.startBtn.classList.add('_disabled');
  }, 800);
};

Game.prototype.giveup = function() {
  this.mask.classList.remove('_hide');
  this.layer.classList.remove('_hide');
  this.giveupBtn.classList.remove('_show');
  this.hintBtn.classList.remove('_show');
  this.timer.classList.add('_hide');
  this.win.classList.add('_hide');
  this.intro.classList.remove('_hide');
  this.header.classList.remove('_start');
  this.panel.classList.remove('_start');
  this.container.classList.remove('_start');
  this.uploadBtn.classList.remove('_hide');
  this.recutBtn.classList.remove('_hide');
  this.startBtn.classList.add('_disabled');
  this.onGiveup && this.onGiveup();
};
// @ts-nocheck

function Game() {
  this.init();
  this.addListeners();
  this.gameProcessControl();
}

Game.prototype.init = function() {
  this.container = document.querySelector('.container');
  this.panel = document.querySelector('#panel');
  this.mask = this.container.querySelector('.mask');
  this.layer = this.container.querySelector('.layer');
  this.startBtn = document.querySelector('#start');
  this.giveupBtn = document.querySelector('#giveup');
  this.againBtn = document.querySelector('#again');
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
  this.againBtn.addEventListener('click', function() {
    THIS.again();
  });
};

Game.prototype.gameProcessControl = function(info) {
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
};

Game.prototype.start = function() {
  var THIS = this;
  this.panel.classList.add('_start');
  this.container.classList.add('_start');
  THIS.onBeforeStart && THIS.onBeforeStart();
  clearTimeout(this.startBtn.timer);
  this.startBtn.timer = setTimeout(function() {
    THIS.mask.classList.add('_hide');
    THIS.layer.classList.add('_hide');
    THIS.giveupBtn.classList.remove('_hide');
  }, 800);
};
Game.prototype.giveup = function() {};
Game.prototype.again = function() {};
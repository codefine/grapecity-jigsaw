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
  this.win = this.layer.querySelector('.win');
  this.uploadBtn = this.layer.querySelector('.upload');
  this.startBtn = document.querySelector('#start');
  this.giveupBtn = document.querySelector('#giveup');
  this.hintBtn = document.querySelector('#hint');
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
  if (typeof info.onSuccess === 'function') {
    this.onSuccess = function() {
      info.onSuccess();
      THIS.mask.classList.remove('_hide');
      THIS.layer.classList.remove('_hide');
      THIS.giveupBtn.classList.remove('_show');
      THIS.hintBtn.classList.remove('_show');
      THIS.win.classList.remove('_hide');
      THIS.intro.classList.add('_hide');
      THIS.uploadBtn.classList.add('_hide');
      clearTimeout(THIS.startBtn.timer);
      THIS.startBtn.timer = setTimeout(function() {
        THIS.header.classList.remove('_start');
        THIS.panel.classList.remove('_start');
        THIS.container.classList.remove('_start');
        THIS.uploadBtn.classList.remove('_hide');
      }, 800);
    };
  }
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
  }, 800);
};

Game.prototype.giveup = function() {};
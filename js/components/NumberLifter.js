// @ts-nocheck

function NumberLifter(containerEl) {
  this.containerEl = containerEl;
  this.container = document.querySelector(containerEl);
  this.suggestiveCells = 4;
  this.init();
  this.checkLifterStatus(0);
  this.addListeners();
}

NumberLifter.prototype.init = function() {
  this.valueEl = this.container.querySelector('.value');
  this.lifterDown = this.container.querySelector('.lifter > .down');
  this.lifterUp = this.container.querySelector('.lifter > .up');
}

NumberLifter.prototype.addListeners = function() {
  var THIS = this;
  this.lifterDown.addEventListener('click', function() {
    var value = THIS.checkLifterStatus(-1);
    THIS.applyValue(value);
  });
  this.lifterUp.addEventListener('click', function() {
    var value = THIS.checkLifterStatus(1);
    THIS.applyValue(value);
  });
}

NumberLifter.prototype.checkLifterStatus = function(step) {
  var value = parseInt(this.valueEl.innerHTML) + step;
  if (value <= 1) {
    this.lifterDown.classList.add('_disabled');
    return 1;
  } else {
    this.lifterDown.classList.remove('_disabled');
  }
  return value;
}

NumberLifter.prototype.applyValue = function(value) {
  this.valueEl.innerHTML = value;
}

NumberLifter.prototype.doSuggest = function(size) {
  var type = this.containerEl.substring(1);
  var width = size[0];
  var height = size[1];
  if (width >= height) {
    if (type === 'row') {
      this.applyValue( Math.ceil(width / height * this.suggestiveCells) );
    } else {
      this.applyValue(this.suggestiveCells);
    }
  } else {
      if (type === 'row') {
        this.applyValue(this.suggestiveCells);
      } else {
        this.applyValue( Math.ceil(height / width * this.suggestiveCells) );
      }
  }
}
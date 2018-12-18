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
};

NumberLifter.prototype.addListeners = function() {
    var THIS = this;
    this.lifterDown.addEventListener('click', function() {
        var value = parseInt(THIS.valueEl.innerHTML) - 1;
        THIS.applyValue(value);
    });
    this.lifterUp.addEventListener('click', function() {
        var value = parseInt(THIS.valueEl.innerHTML) + 1;
        THIS.applyValue(value);
    });
};

NumberLifter.prototype.checkLifterStatus = function(value) {
    if (value <= 2) {
        this.lifterDown.classList.add('_disabled');
        return 2;
    } else {
        this.lifterDown.classList.remove('_disabled');
    }
    return value;
};

NumberLifter.prototype.applyValue = function(value) {
    var THIS = this;
    value = this.checkLifterStatus(value);
    this.valueEl.classList.add('_change');
    this.valueEl.innerHTML = value;
    clearTimeout(this.valueEl.timer);
    this.valueEl.timer = setTimeout(function() {
        THIS.valueEl.classList.remove('_change');
    }, 150);
};

NumberLifter.prototype.doSuggest = function(size) {
    var type = this.containerEl.substring(1);
    var width = size[0];
    var height = size[1];
    var value = 1;
    if (width >= height) {
        if (type === 'row') {
            value = this.suggestiveCells;
        } else {
            value = Math.ceil((width / height) * this.suggestiveCells);
        }
    } else {
        if (type === 'row') {
            value = Math.ceil((height / width) * this.suggestiveCells);
        } else {
            value = this.suggestiveCells;
        }
    }
    this.applyValue(value);
    return value;
};

NumberLifter.prototype.getNumber = function() {
    return Number(this.valueEl.innerHTML);
};

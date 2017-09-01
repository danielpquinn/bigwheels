(function (ctx) {

  function Keyboard(id) {
    this.id = id;
    this.leftPressed = false;
    this.rightPressed = false;
    this.upPressed = false;
    this.events = {};
    this.pressedKeys = {};

    this.onKeydown = this.onKeydown.bind(this);
    this.onKeyup = this.onKeyup.bind(this);
  }

  Keyboard.keyMap = {
    "32": "space",
    "37": "left",
    "38": "up",
    "39": "right",
    "65": "a",
    "68": "d",
    "83": "s",
    "87": "w"
  };

  Keyboard.prototype.on = function (eventName, handler) {
    if (!this.events[eventName]) { this.events[eventName] = []; }
    this.events[eventName].push(handler);
  };

  Keyboard.prototype.off = function (eventName, handler) {
    if (!this.events[eventName]) { return; }
    var handlerIndex = this.events[eventName].indexOf(handler);
    this.events[eventName].splice(handlerIndex, 1);
  };

  Keyboard.prototype.trigger = function (eventName, data) {
    if (!this.events[eventName]) { return; }
    this.events[eventName].forEach(function (handler) {
      handler(data);
    });
  }

  Keyboard.prototype.onKeydown = function (e) {
    var keyCode = e.keyCode.toString();

    if (Keyboard.keyMap[keyCode]) {
      var key = Keyboard.keyMap[keyCode];

      if (!this.pressedKeys[key]) {
        this.trigger("keyDown", key);
        this.pressedKeys[key] = true;
      }
    }
  };

  Keyboard.prototype.onKeyup = function (e) {
    var keyCode = e.keyCode.toString();

    if (Keyboard.keyMap[keyCode]) {
      var key = Keyboard.keyMap[keyCode];

      if (this.pressedKeys[key]) {
        this.trigger("keyUp", key);
        delete this.pressedKeys[key];
      }
    }
  };

  ctx.Keyboard = Keyboard;

}(this));
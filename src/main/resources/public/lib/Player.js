(function (ctx) {

  function Player(id) {
    PhysicalObject.call(this, 20, 40);
    this.id = id;
    this.forward = true;
    this.keyboard = new Keyboard();
    this.inAir = false;
    this.movingRight = false;
    this.movingLeft = false;
    this.stunting = false;
    this.imageEl = document.createElement("img");

    this.onKeyDown = this.onKeyDown.bind(this);
    this.keyboard.on("keyDown", this.onKeyDown);
  }

  Player.maxVx = 8;
  Player.maxVy = 8;

  Player.rollRight = "/images/roll-right.png";
  Player.toeRollRight = "/images/toe-roll-right.png";
  Player.pushRight = "/images/push-right.png";
  Player.jumpRight = "/images/jump-right.png";
  Player.fallRight = "/images/fall-right.png";
  Player.slideRight = "/images/slide-right.png";
  Player.rollLeft = "/images/roll-left.png";
  Player.toeRollLeft = "/images/toe-roll-left.png";
  Player.pushLeft = "/images/push-left.png";
  Player.jumpLeft = "/images/jump-left.png";
  Player.fallLeft = "/images/fall-left.png";
  Player.slideLeft = "/images/slide-left.png";

  Player.prototype.destroy = function () {
    this.keyboard.off("keyDown", this.onKeyDown);
  }

  Player.prototype.onKeyDown = function (key) {
    switch (key) {
      case "left":
      this.oneEighty();
      break;
      case "right":
      this.oneEighty();
      break;
    }
  };

  Player.prototype.oneEighty = function () {
    this.forward = !this.forward;
  };

  Player.prototype.setImageSrc = function (src) {
    if (this.imgSrc !== src) {
      this.imgSrc = src;
      this.imageEl.setAttribute("src", this.imgSrc);
    }
  }

  Player.prototype.updateImage = function () {
    if (this.forward) {
      if (this.inAir) {
        if (this.vy < 0) {
          this.setImageSrc(Player.jumpRight);
        } else {
          this.setImageSrc(Player.fallRight);
        }
      } else if (this.keyboard.pressedKeys["a"]) {
        this.setImageSrc(this.vx > 0 ? Player.slideRight : Player.pushRight);
      } else if (this.keyboard.pressedKeys["d"]) {
        this.setImageSrc(this.vx > 0 ? Player.pushRight : Player.slideLeft);
      } else if (this.keyboard.pressedKeys["space"]) {
        this.setImageSrc(Player.toeRollRight);
      } else {
        this.setImageSrc(Player.rollRight);
      }
    } else {
      if (this.inAir) {
        if (this.vy < 0) {
          this.setImageSrc(Player.jumpLeft);
        } else {
          this.setImageSrc(Player.fallLeft);
        }
      } else if (this.keyboard.pressedKeys["a"]) {
        this.setImageSrc(this.vx > 0 ? Player.slideRight : Player.pushLeft);
      } else if (this.keyboard.pressedKeys["d"]) {
        this.setImageSrc(this.vx > 0 ? Player.pushLeft : Player.slideLeft);
      } else if (this.keyboard.pressedKeys["space"]) {
        this.setImageSrc(Player.toeRollLeft);
      } else {
        this.setImageSrc(Player.rollLeft);
      }
    }
  };

  Player.prototype.handleInput = function () {
    if (this.keyboard.pressedKeys["d"] && this.vx < Player.maxVx) {
      this.vx += 0.3;
    }

    if (this.keyboard.pressedKeys["a"] && this.vx > Player.maxVx * -1) {
      this.vx -= 0.3;
    }

    if (this.keyboard.pressedKeys["w"] && !this.inAir) {
      this.y -= 1;
      this.vy -= 6;
    }
  }

  Player.prototype.draw = function (ctx) {
    this.updateImage();
    ctx.drawImage(this.imageEl, Math.floor(this.x) - 10, Math.floor(this.y) - 44);
  };

  ctx.Player = Player;

}(this));
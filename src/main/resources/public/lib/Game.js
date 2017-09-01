(function (ctx) {

  function Game(levels) {
    this.loopTimeout = null;
    this.syncTimeout = null;
    this.keyboard = new Keyboard();
    this.players = {};
    this.canvas = new Canvas(Game.width, Game.height);
    this.lines = levels.map(function (level) { return new Line(level); });
    this.playerData = {};
    this.playerId = null;
    this.webSocket = new WebSocket("ws://" + location.hostname + ":" + location.port + "/game/");

    this.webSocket.onmessage = this.onMessage.bind(this);
    this.loop = this.loop.bind(this);
    this.sync = this.sync.bind(this);

    this.sendKeydown = this.sendKeydown.bind(this);
    this.sendKeyup = this.sendKeyup.bind(this);
    document.addEventListener("keydown", this.sendKeydown);
    document.addEventListener("keyup", this.sendKeyup);
  }

  Game.width = 1200;
  Game.height = 600;
  Game.framerate = 17; // 60 FPS

  Game.prototype.start = function () {
    this.loop();
    this.sync();
  };

  Game.prototype.pause = function () {
    clearTimeout(this.timeout);
    clearTimeout(this.syncTimeout);
  };

  Game.prototype.onMessage = function (e) {
    let data = JSON.parse(e.data);
    console.log(data);
    switch (data.topic) {
      case "connect":
        this.addPlayer(data.userId);
        if (this.playerId === null) {
          this.playerId = data.userId;
          this.start();
        }
        break;
      case "disconnect":
        this.removePlayer(data.userId);
        if (data.userId === this.playerId) {
          this.pause();
        }
        break;
      case "sync":
        this.onSync(data);
        break;
      case "keydown":
        this.onKeydown(data);
        break;
      case "keyup":
        this.onKeyup(data);
        break;
      default:
        break;
    }
  }

  Game.prototype.onKeydown = function (data) {
    if (data.userId === this.playerId) { return; }
    var player = this.players[data.userId];
    player.keyboard.onKeydown(data);
  };

  Game.prototype.onKeyup = function (data) {
    if (data.userId === this.playerId) { return; }
    var player = this.players[data.userId];
    player.keyboard.onKeyup(data);
  };

  Game.prototype.sendKeydown = function (e) {
    e.preventDefault();
    var player = this.players[this.playerId];
    player.keyboard.onKeydown(e);
    this.webSocket.send(JSON.stringify({
      topic: "keydown",
      keyCode: e.keyCode
    }));
  };

  Game.prototype.sendKeyup = function (e) {
    e.preventDefault();
    var player = this.players[this.playerId];
    player.keyboard.onKeyup(e);
    this.webSocket.send(JSON.stringify({
      topic: "keyup",
      keyCode: e.keyCode
    }));
  };

  Game.prototype.onSync = function (data) {
    var userId = data.userId;
    var player = this.players[userId];
    if (!player) {
      player = this.addPlayer(userId);
    }
    player.x = data.player.x;
    player.y = data.player.y;
    player.vx = data.player.vx;
    player.vy = data.player.vy;
    player.forward = data.player.forward;
  };

  Game.prototype.addPlayer = function (id) {
    var player = new Player(id);
    this.players[id] = player;
    this.playerData[id] = { line: 0, segment: 0 };
    return player;
  };

  Game.prototype.removePlayer = function (id) {
    delete this.players[id];
  };

  Game.prototype.applyGravity = function (player) {
    player.vy += 0.3;
  };

  Game.prototype.updatePositions = function (player) {
    if (player.vx > Player.maxVx) {
      player.vx = Player.maxVx;
    }
    if (player.vy < Player.maxVy * -1) {
      player.vy = Player.maxVy * -1;
    }
    player.x += player.vx;
    player.y += player.vy;
  };

  Game.prototype.updatePlayerData = function (player) {
    var playerData = this.playerData[player.id];
    var line = this.lines[playerData.line];

    if (playerData.segment < line.points.length - 2
      && player.x > line.points[playerData.segment + 1][0]) {
      playerData.segment += 1;
    } else if (player.x > Game.width) {
      player.x = 0;
      playerData.line += 1;
      if (playerData.line > this.lines.length - 1) { playerData.line = 0; }
      playerData.segment = 0;
    } else if (player.x < line.points[playerData.segment][0]) {
      if (playerData.segment > 0) {
        playerData.segment -= 1;
      } else {
        player.x = Game.width;
        playerData.line -= 1;
        if (playerData.line < 0) {
          playerData.line = this.lines.length - 1;
        }
        line = this.lines[playerData.line];
        playerData.segment = line.points.length - 2;
      }
    }
  }

  Game.prototype.detectCollisions = function (player) {
    var playerData = this.playerData[player.id];
    var line = this.lines[playerData.line];

    var point1 = line.points[playerData.segment];
    var point2 = line.points[playerData.segment + 1];
    var xDiff = point2[0] - point1[0];
    var yDiff = point2[1] - point1[1];
    var playerSlopeProgress = (player.x - point1[0]) / xDiff;
    var groundY = point1[1] + (yDiff * playerSlopeProgress);

    if (player.y > groundY) {
      var slope = xDiff === 0 ? 0 : yDiff / xDiff;

      player.inAir = false;
      player.vx += slope * 0.2;
      player.vy = player.vx * slope;
      player.y = groundY;
    } else {
      player.inAir = true;
    }
  };

  Game.prototype.loop = function () {
    var self = this;
    var playerData = this.playerData[this.playerId];

    self.canvas.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);

    self.lines[self.playerData[self.playerId].line].draw(self.canvas.ctx);

    Object.keys(self.players).forEach(function (key) {
      var player = self.players[key];
      player.handleInput();
      self.applyGravity(player);
      self.updatePositions(player);
      self.updatePlayerData(player);
      self.detectCollisions(player);
      if (playerData.line === self.playerData[player.id].line) {
        player.draw(self.canvas.ctx);
      }
    });

    self.loopTimeout = setTimeout(self.loop, Game.framerate);
  };

  Game.prototype.sync = function () {
    var player = this.players[this.playerId];
    this.webSocket.send(JSON.stringify({
      topic: "sync",
      player: player
    }));
    self.syncTimeout = setTimeout(this.sync, 5000);
  }

  ctx.Game = Game;

}(this));
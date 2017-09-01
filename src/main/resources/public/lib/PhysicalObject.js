(function (ctx) {

  function PhysicalObject(width, height) {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.width = width;
    this.height = height;
  }

  ctx.PhysicalObject = PhysicalObject;

}(this));
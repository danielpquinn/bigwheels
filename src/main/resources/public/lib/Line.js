(function (ctx) {

  function Line(points) {
    this.points = points;
  }

  Line.prototype.draw = function (ctx) {
    ctx.beginPath();

    ctx.moveTo(this.points[0][0], this.points[0][1]);

    this.points.slice(1).forEach(function (point) {
      ctx.lineTo(point[0], point[1]);
    });

    ctx.stroke();
  };

  ctx.Line = Line;

}(this));
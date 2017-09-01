(function (ctx) {

  function Canvas(width, height) {
    this.el = document.createElement("canvas");
    this.width = width;
    this.height = height;
    this.el.setAttribute("width", width);
    this.el.setAttribute("height", height);
    this.ctx = this.el.getContext("2d");
  }

  ctx.Canvas = Canvas;

}(this));
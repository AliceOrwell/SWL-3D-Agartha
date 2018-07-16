var easycam;

var settings = {
  width: 1900,
  height: 800,
  background: 32,
  map: "data/agartha.png",
  map_max_x: 1024,
  map_max_y: 1024,
  rot_scale: 0.0008,
  damping: 0
};


var stars;
var numStars = 500;
var speed = 10;

var img;

function preload() {
  img = loadImage(settings.map);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  easycam.setViewport([0,0,windowWidth, windowHeight]);
}

function setup() {
  pixelDensity(1);

  var canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  setAttributes('antialias', true);

  var state = {
    distance : 900,
    center   : [0, 0, 0]
  };

  easycam = createEasyCam(this._renderer, state);
  easycam.setRotationScale(settings.rot_scale);
  easycam.setDamping(settings.damping);

  easycam.rotateZ(-PI * 0.1);
  easycam.rotateX(-PI * 0.25);
}

function draw() {
  // projection
  perspective(60 * PI/180, windowWidth/windowHeight, 1, 20000);

  // background
  background(settings.background);

  var offset_x = settings.map_max_x * 0.5;
  var offset_y = settings.map_max_y * 0.5;

  translate(-offset_x, offset_y);
  rotateX(-PI);

  // map
  push();
  translate(settings.map_max_x/2, settings.map_max_y/2);
  rotateX(PI);
  texture(img);
  plane(settings.map_max_x, settings.map_max_y);
  pop();

  //axis
  push();
  translate(0, 0, -2);

  fill(150);
  stroke(255, 0, 0);
  line(0, 0, settings.map_max_x, 0);

  stroke(0, 255, 0);
  line(0, 0, 0, settings.map_max_y);
  pop();

  //branches
  drawBranches(branches);

  //jumps
  drawJumps(jumps);

  //lore
  noStroke();
  fill(70, 70, 230);
  for (var i=0; i < lore.length; i++) {
    if (lore[i].length > 0) {
      var p = lore[i];

      push();
      translate(p[0], p[1], -p[2] * 0.5);
      box(5);
      pop();
    }
  }
}

function drawJumps(jumps) {
  for (var i=0; i < jumps.length-1; i+=2) {
    var p1 = jumps[i];
    var p2 = jumps[i+1];

    beginShape();
    stroke(250, 100, 100);
    drawVertex(p1);
    drawVertex(p2);
    endShape();
  }
}

function drawBranches(branches) {
  for (var i=0; i < branches.length; i++) {
    if (branches[i].length > 0) {
      drawBranch(branches[i]);
    }
  }
}

function drawBranch(branch_data) {
  stroke(190, 190, 190);
  var p1 = branch_data[0];
  var p2 = [p1[0], p1[1], 0];
  beginShape();
    drawVertex(p1);
    drawVertex(p2);
  endShape();

  push();
  // fill

  stroke(240, 230, 120);
  noFill();
  beginShape();
  for (var i=0; i < branch_data.length; i++) {
    var v = branch_data[i];
    drawVertex(v);
  }
  endShape(CLOSE);
  pop();
}

function drawVertex(p) {
  vertex(p[0], p[1], -p[2] * 0.5);
}

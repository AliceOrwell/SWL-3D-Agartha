var easycam;
var img;
var selColourMode;
var stepCount;

var settings = {
  version: "0.0.1",
  background: 32,
  cam_rot: [0.908, 0.418, -0.009, 0.003],
  cam_dis: 700,
  cam_pos: [0, 0, 0],
  map: "data/agartha.png",
  map_max_x: 1024,
  map_max_y: 1024,
  rot_scale: 0.0008,
  wheel_scale: 60,
  damping: 0.4,
  jumps_col: [255, 40, 40],
  colourMode: "Basic",
  render_axis: false,
  render_lore: true,
  render_branches: true,
  render_map: true,
  render_jumps: true,
  branch_stroke_weight: 1.2
};


function preload() {
  img = loadImage(settings.map);
}

function windowResized() {
  resizeCanvas(windowWidth-5, windowHeight-5);
  easycam.setViewport([0,0,windowWidth-5, windowHeight-5]);
}

function setup() {
  stepCount = 0;

  pixelDensity(1);

  var canvas = createCanvas(windowWidth-5, windowHeight-5, WEBGL);
  setAttributes('antialias', true);

  var state = {
    distance : settings.cam_dis,
    center   : settings.cam_pos,
    rotation : settings.cam_rot
  };

  easycam = new Dw.EasyCam(this._renderer, state);
  easycam.setRotationScale(settings.rot_scale);
  easycam.setDamping(settings.damping);
  easycam.setWheelScale(settings.wheel_scale);

  initHUD();
}

function draw() {
  stepCount++;
  stepCount = stepCount % 1000;

  // projection
  perspective(60 * PI/180, windowWidth/windowHeight, 1, 1900);

  // background
  background(settings.background);

  // offset everything so the coord system matches the map's
  var offset_x = settings.map_max_x * 0.5;
  var offset_y = settings.map_max_y * 0.5;
  translate(-offset_x, offset_y);
  rotateX(-PI);

  fill(50);
  stroke(50);
  strokeWeight(2);

  // map
  if (settings.render_map) {
    drawMap();
  }

  //axis
  if (settings.render_axis) {
    drawAxis();
  }

  //branches
  if (settings.render_branches) {
    drawBranches(branches);
  }

  //jumps
  if (settings.render_jumps) {
    drawJumps(jumps);
  }

  //lore
  if (settings.render_lore) {
    drawLore(lore);
  }

  displayHUD();
}


function drawMap() {
  push();

  translate(settings.map_max_x/2, settings.map_max_y/2);
  rotateX(PI);

  texture(img);
  plane(settings.map_max_x, settings.map_max_y);

  normalMaterial();
  pop();
}

function drawLore(lore) {
  push();

  stroke(32);
  strokeWeight(0.5);
  fill(250, 180, 0);

  for (var i=0; i < lore.length; i++) {
    if (lore[i].length > 0) {
      var p = lore[i];

      push();
      var z = (-p[2] * 0.5) - 2;
      translate(p[0], p[1], z);

      var r  = stepCount % 360;
      rotateZ(r * PI/180);
      box(5, 2, 5);
      pop();
    }
  }
  pop();
}

function drawJumps(jumps) {
  push();

  stroke(settings.jumps_col);
  strokeWeight(1);
  noFill();

  for (var i=0; i < jumps.length-1; i+=2) {
    var p1 = jumps[i];
    var p2 = jumps[i+1];

    beginShape();
    drawVertex(p1);
    drawVertex(p2);
    endShape();
  }

  pop();
}

function drawBranches(branches) {
  for (var i=0; i < branches.length; i++) {
    if (branches[i].length > 0) {
      drawBranch(branches[i]);
    }
  }
}

function drawBranch(branch_data) {
  // hight line
  drawHeightLine(branch_data[0]);

  if (settings.colourMode == "Proximity") {
    colourDistance(branch_data);
  }
  else if (settings.colourMode == "Height") {
    colourHeight(branch_data);
  }
  else {
    colourBasic(branch_data);
  }
}

function colourBasic(branch_data) {
  push();

  stroke(240, 230, 170);
  strokeWeight(settings.branch_stroke_weight);
  noFill();

  beginShape();
  for (var i=0; i < branch_data.length; i++) {
    var v = branch_data[i];
    drawVertex(v);
  }
  endShape(CLOSE);

  pop();
}

function colourDistance(branch_data) {
  push();

  colorMode(HSB, 255);
  strokeWeight(settings.branch_stroke_weight);
  noFill();

  for (var i=0; i < branch_data.length-1; i++) {
    drawBranchSeg(branch_data[i], branch_data[i+1]);
  }
  drawBranchSeg(branch_data[branch_data.length-1], branch_data[0]);
  pop();
}

function colourHeight(branch_data) {
  push();
  colorMode(HSB, 255);
  strokeWeight(settings.branch_stroke_weight);
  noFill();

  var v = branch_data[0];
  var v_min = 0;
  var v_max = 510;    // magic number - > heightest agartha point
  var ch = map(v[2], v_min, v_max, 0, 250);

  stroke(ch, 255, 255);

  beginShape();
  for (var i=0; i < branch_data.length; i++) {
    v = branch_data[i];
    drawVertex(v);
  }
  endShape(CLOSE);
  pop();
}

function drawHeightLine(point) {
  push();

  stroke(190, 190, 190);
  strokeWeight(0.8);

  var p1 = point;
  var p2 = [point[0], point[1], 0];
  beginShape();
    drawVertex(p1);
    drawVertex(p2);
  endShape();
  pop();
}

function drawBranchSeg(p1, p2) {
  function manhatten(p1, p2) {
    function diff(a, b) {
      return Math.abs(a - b);
    }

    var x = diff(p1[0], p2[0]);
    var y = diff(p1[1], p2[1]);
    var z = diff(p1[2], p2[2]);
    return x + y + z;
  }

  var pos_c = easycam.getPosition();

  var pos = [];
  pos[0] = p1[0] - (settings.map_max_x * 0.5);
  pos[1] = p1[1] - (settings.map_max_y * 0.5);
  pos[2] = -p1[2] * 0.5;

  var dist = manhatten(pos_c, pos);

  var dist_c = Math.abs(pos_c[0]) + Math.abs(pos_c[1]) + Math.abs(pos_c[2]);
  var d_max = (settings.map_max_x/2) + (settings.map_max_x/2) + 510;
  var d_min = 0;
  if (dist_c > (settings.map_max_x/2)) {
    d_min = (settings.map_max_x/2);
  }

  var ch = map(dist, d_min, d_max, 10, 230);
  stroke(ch, 255, 255);

  push();
  beginShape();
  drawVertex(p1);
  drawVertex(p2);
  endShape();
  pop();
}

function drawVertex(p) {
  vertex(p[0], p[1], -p[2] * 0.5);
}

function drawAxis() {
  push();
  translate(0, 0, -2);

  stroke(255, 0, 0);
  line(0, 0, settings.map_max_x, 0);

  stroke(0, 255, 0);
  line(0, 0, 0, settings.map_max_y);
  pop();
}

var easycam;
var selColourMode;

var settings = {
  background: 32,
  map: "data/agartha.png",
  map_max_x: 1024,
  map_max_y: 1024,
  rot_scale: 0.0008,
  wheel_scale: 60,
  damping: 0.4,
  jumps_col: [255, 40, 40],
  colourMode: "Basic"
};


var stars;
var numStars = 500;
var speed = 10;

var img;

function preload() {
  img = loadImage(settings.map);
}

function windowResized() {
  resizeCanvas(windowWidth-5, windowHeight-5);
  easycam.setViewport([0,0,windowWidth-5, windowHeight-5]);
}

function setup() {
  pixelDensity(1);

  var canvas = createCanvas(windowWidth-5, windowHeight-5, WEBGL);
  setAttributes('antialias', true);

  var state = {
    distance : 900,
    center   : [0, 0, 0],
    rotation : [0.826, 0.414, -0.211, 0.317]
  };

  easycam = new Dw.EasyCam(this._renderer, state);
  easycam.setRotationScale(settings.rot_scale);
  easycam.setDamping(settings.damping);
  easycam.setWheelScale(settings.wheel_scale);

  //easycam.rotateZ(-PI * 0.1);
  //easycam.rotateX(-PI * 0.25);

  initHUD();
}

function draw() {
  // projection
  //perspective(60 * PI/180, windowWidth/windowHeight, 1, 20000);
  perspective(60 * PI/180, width/height, 1, 5000);

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

  fill(150);
  strokeWeight(2);

  //axis
  //drawAxis();

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

  displayHUD();
}

function initHUD() {
  var hleft = select('#hud-left');
  var hright = select('#hud-right');

  // left side
  createElement('li', "Framerate:" ).parent(hleft).attribute('gap', '');
  createElement('li', "Viewport:"  ).parent(hleft);
  createElement('li', "Distance:"  ).parent(hleft).attribute('gap', '');
  createElement('li', "Center:"    ).parent(hleft);
  createElement('li', "Rotation:"  ).parent(hleft);
  createElement('li', "Colour Mode").parent(hleft).attribute('gap', '');

  // right side
  createElement('li', '.').parent(hright).class('').attribute('gap', '');
  createElement('li', '.').parent(hright).class('');
  createElement('li', '.').parent(hright).class('orange').attribute('gap', '');
  createElement('li', '.').parent(hright).class('orange');
  createElement('li', '.').parent(hright).class('orange');

  var e = createElement('li').parent(hright).class('').attribute('gap', '');
  selColourMode = createSelect().parent(e);
  selColourMode.option('Basic');
  selColourMode.option('Height');
  selColourMode.option('Proximity');
  selColourMode.changed(selColourModeEvent);
}


function selColourModeEvent() {
  var item = selColourMode.value();
  settings.colourMode = item;
}

function displayHUD() {


  var state = easycam.getState();

  var ul = select('#hud-right');
  ul.elt.children[0].innerHTML = nfs(frameRate()          , 1, 2);
  ul.elt.children[1].innerHTML = nfs(easycam.getViewport(), 1, 0);
  ul.elt.children[2].innerHTML = nfs(state.distance       , 1, 2);
  ul.elt.children[3].innerHTML = nfs(state.center         , 1, 2);
  ul.elt.children[4].innerHTML = nfs(state.rotation       , 1, 3);

  easycam.beginHUD();
  easycam.endHUD();
}

function drawJumps(jumps) {
  stroke(settings.jumps_col);
  for (var i=0; i < jumps.length-1; i+=2) {
    var p1 = jumps[i];
    var p2 = jumps[i+1];

    beginShape();
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

function colourDistance(branch_data) {
  push();
  colorMode(HSB, 255);
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
  noFill();

  var v = branch_data[0];
  var v_min = 0;
  var v_max = 510;
  var ch = map(v[2], v_min, v_max, 10, 60);
  var cs = map(v[2], v_min, v_max, 220, 255);
  var cb = map(v[2], v_min, v_max, 240, 255);
  stroke(ch, cs, cb);

  beginShape();
  for (var i=0; i < branch_data.length; i++) {
    v = branch_data[i];
    drawVertex(v);
  }
  endShape(CLOSE);
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

  var d_max = Math.abs(pos_c[0]) + Math.abs(pos_c[1]) + Math.abs(pos_c[2]);

  if (d_max > settings.map_max_x/2) {
    d_max = settings.map_max_x/2;
    dist = dist % (settings.map_max_x/2);
  }
  var d_min = 0;

  var ch = map(dist, d_min, d_max, 10, 200);
  var cs = map(dist, d_min, d_max, 255, 0);
  var cb = map(dist, d_min, d_max, 255, 200);
  stroke(ch, 255, 255);

  beginShape();
  drawVertex(p1);
  drawVertex(p2);
  endShape();
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

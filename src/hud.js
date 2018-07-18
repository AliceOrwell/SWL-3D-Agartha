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

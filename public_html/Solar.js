// Assignmnt 2: Damilare Olaniyan
"use strict";

function Solar(canvasID) {
  var self = this; 
  this.canvasID = canvasID;
  var canvas = this.canvas = document.getElementById(canvasID);
  if (!canvas) {
    alert("Canvas ID '" + canvasID + "' not found.");
    return;
  }

  var gl = this.gl = WebGLUtils.setupWebGL(this.canvas);
  if (!gl) {
    alert("WebGL not available in this browser");
    return;
  }
  gl.enable(gl.DEPTH_TEST);

  var aspectRatio = (canvas.width/2) / canvas.height;
  this.aspectScale = aspectRatio > 1.0 ? scalem(1.0/aspectRatio, 1.0, 1.0) : scalem(1.0, aspectRatio, 1.0);

  var isPlaying = false;
  var viewMatrix = mat4();

  var playPauseButton = document.getElementById("gl-canvas-play");
  var switchViewButton = document.getElementById("gl-canvas-Switch");
  var showOrbitButton = document.getElementById("gl-canvas-Orbit");

  var showOrbit = false;
  showOrbitButton.addEventListener("click", function(){
    showOrbit = !showOrbit;
  });

  playPauseButton.addEventListener("click", function(){
    isPlaying = !isPlaying;
  });

  var switchView = true;
  switchViewButton.addEventListener("click", function(){
    console.log("Switching view");
    switchView = !switchView;
  });

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  this.shaderProgram = initShaders(gl, "vShader.glsl", "fShader.glsl");
  if (this.shaderProgram === null) return;
  gl.useProgram(this.shaderProgram);

  var fov = 90.0;
  var aspect = this.canvas.width / this.canvas.height;
  var near = 0.1;
  var far = 20.0;
  this.projectionMatrix = perspective(fov, aspect, near, far);

  var longitude  = 0;
  var latitude  = 90; 
  var radius  = 2.0;

  var cx = radius * Math.cos(latitude*Math.PI/180) * Math.cos(longitude*Math.PI/180);
  var cy = radius * Math.sin(latitude*Math.PI/180);
  var cz = radius * Math.cos(latitude*Math.PI/180) * Math.sin(longitude*Math.PI/180);

  var eye = vec3(cx,cy,cz);  
  var at = vec3(0,0,0);  
  var up = vec3(0,1,0);  
  viewMatrix = lookAt(eye, at, up);
  viewMatrix = mult(this.aspectScale, viewMatrix);

  
  
  var animate = function(){
  
    self.render(isPlaying, viewMatrix, switchView, showOrbit);
    requestAnimationFrame(animate); 
  };
  
  var orbitDistArray = [5, 10, 15, 2, 25, 3, 2, 2.5, 3, 40, 50, 60];
  for(var i = 0; i < orbitDistArray.length; i++){
      orbitDistArray[i] = orbitDistArray[i]/20;
  }

  const colors = [
    "sun.bmp", // Sun
    "mercury.bmp", // Mercury
    "venus.bmp", // Venus
    "earth.bmp", // Earth
    "mars.bmp", // Mars
    "jupiter.bmp", // Jupiter
    "saturn.bmp", // Saturn
    "uranus.bmp", // Uranus
    "neptune.bmp", // Neptune
    "moon.bmp", // Moon of Earth
    "moon.bmp", // Moon of Jupiter
    "moon.bmp"  // Moon of Saturn
  ];

  //Planet constructor takes: gl, shaderProgram, scale, image, dayPeriod, yearPeriod, orbitDist, axisTilt, orbitTilt
  this.sun = new Planet(gl, this.shaderProgram, 8.0, colors[0], 0, 0, 0, 0, 0);
  this.mercury = new Planet(gl, this.shaderProgram, 1.0, colors[1], 10, 100, 5, 0, 7);
  this.venus = new Planet(gl, this.shaderProgram, 2.0, colors[2],1, 50, 10, 2, 7);
  this.earth = new Planet(gl, this.shaderProgram, 2.0, colors[3], 200, 15, 15, 24, 7);
  this.earthmoon = new Planet(gl, this.shaderProgram, 0.5, colors[9], 100, 100, 2, 7, 80);
  this.mars = new Planet(gl, this.shaderProgram, 2.0, colors[4], 210, 50, 20, 25, 7);
  this.jupiter = new Planet(gl, this.shaderProgram, 4.0, colors[5], 500, 5, 30, 3, 7);
  this.jupiterEuropa = new Planet(gl, this.shaderProgram, 0.5, colors[10], 100, 100, 2, 0, 10);
  this.jupiterIo = new Planet(gl, this.shaderProgram, 0.25, colors[10], 100, 75, 2.5, 0, 40);
  this.jupiterGanymede = new Planet(gl, this.shaderProgram, 0.75, colors[10], 100, 125, 3, 0, 90);
  this.saturn = new Planet(gl, this.shaderProgram, 4.0, colors[6], 110, 6, 40, 27, 7);
  this.uranus = new Planet(gl, this.shaderProgram, 3.0, colors[7], 250, 2, 50, 82, 7);
  this.neptune = new Planet(gl, this.shaderProgram, 3.0, colors[8], 260, 1, 60, 28, 7);
  this.ship = new Ship(gl, canvas, this.shaderProgram);


  this.mercuryRing = new Ring(gl, this.shaderProgram, 5, 0.01, 7);
  this.venusRing = new Ring(gl, this.shaderProgram, 10, 0.01, 7);
  this.earthRing = new Ring(gl, this.shaderProgram, 15, 0.01, 7);
  this.marsRing = new Ring(gl, this.shaderProgram, 20, 0.01, 7);
  this.jupiterRing = new Ring(gl, this.shaderProgram, 30, 0.01, 7);
  this.saturnOrbit = new Ring(gl, this.shaderProgram, 40, 0.01, 7);
  this.uranusRing = new Ring(gl, this.shaderProgram, 50, 0.01, 7);
  this.neptuneRing = new Ring(gl, this.shaderProgram, 60, 0.01, 7);

  this.saturnRing = new Ring(gl, this.shaderProgram, 3.5, 0.06, 0);
  
  requestAnimationFrame(animate);
 

};

Solar.prototype.render = function(isPlaying, viewMatrix, switchView, showOrbit) {
  var gl = this.gl;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  if (switchView){
    this.ship.render(viewMatrix, this.projectionMatrix);
  }
  else viewMatrix = getViewMatrix();  

  this.sun.render(isPlaying, viewMatrix, this.projectionMatrix, vec3(0,0,0), 1);
  this.mercury.render(isPlaying, viewMatrix, this.projectionMatrix, vec3(0,0,0), 1);
  this.venus.render(isPlaying, viewMatrix, this.projectionMatrix, vec3(0,0,0), 1);
  this.earth.render(isPlaying, viewMatrix, this.projectionMatrix, vec3(0,0,0), 1);
  this.earthmoon.render(isPlaying, viewMatrix, this.projectionMatrix, vec3(0,0,0), 1);
  this.mars.render(isPlaying, viewMatrix, this.projectionMatrix, vec3(0,0,0), 1);
  this.jupiter.render(isPlaying, viewMatrix, this.projectionMatrix, vec3(0,0,0), 1);
  this.jupiterEuropa.render(isPlaying, viewMatrix, this.projectionMatrix, vec3(0,0,0), 1);
  this.jupiterIo.render(isPlaying, viewMatrix, this.projectionMatrix, vec3(0,0,0), 1);
  this.jupiterGanymede.render(isPlaying, viewMatrix, this.projectionMatrix, vec3(0,0,0), 1);
  this.saturn.render(isPlaying, viewMatrix, this.projectionMatrix, vec3(0,0,0), 1);
  this.uranus.render(isPlaying, viewMatrix, this.projectionMatrix, vec3(0,0,0), 1);
  this.neptune.render(isPlaying, viewMatrix, this.projectionMatrix, vec3(0,0,0), 1);
  
  attachMoon(this.earth, this.earthmoon);
  attachMoon(this.jupiter, this.jupiterEuropa);
  attachMoon(this.jupiter, this.jupiterIo);
  attachMoon(this.jupiter, this.jupiterGanymede);

  this.saturnRing.render(viewMatrix, vec3(1,1,0), this.projectionMatrix, vec3(0,0,0), 1);
  attachRing(this.saturn, this.saturnRing);


  if (showOrbit){
    this.mercuryRing.render(viewMatrix, vec3(0,1,1), this.projectionMatrix, vec3(0,0,0), 1);
    this.venusRing.render(viewMatrix, vec3(0,1,1), this.projectionMatrix, vec3(0,0,0), 1);
    this.earthRing.render(viewMatrix, vec3(0,1,1), this.projectionMatrix,vec3(0,0,0), 1);
    this.marsRing.render(viewMatrix, vec3(0,1,1), this.projectionMatrix, vec3(0,0,0), 1);
    this.jupiterRing.render(viewMatrix, vec3(0,1,1), this.projectionMatrix, vec3(0,0,0), 1);
    this.saturnOrbit.render(viewMatrix, vec3(0,1,1), this.projectionMatrix, vec3(0,0,0), 1);
    this.uranusRing.render(viewMatrix, vec3(0,1,1), this.projectionMatrix, vec3(0,0,0), 1);
    this.neptuneRing.render(viewMatrix, vec3(0,1,1), this.projectionMatrix, vec3(0,0,0), 1);
  }
 

};

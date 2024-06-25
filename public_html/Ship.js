// Assignmnt 2: Damilare Olaniyan
"use strict";

let moveValue = 0.2;
let rotateValue = 1;

let currentRotation = 0;
let currentForward = 0;
let currentSideways = 0;
let currentUp = 0;
let initialDistance = 0.5;

let long = 0;
let lat = 0;
let rad = 2.0;

function Ship(gl, canvas, shaderProgram) {
    this.gl = gl;
    this.shaderProgram = shaderProgram;
    this.vertexArray = gl.createVertexArray();
    this.color = vec3(1, 1, 1);
    gl.bindVertexArray(this.vertexArray);
    var s = 0.05;
    this.triangleArray = Float32Array.of(
        0.0, s, 0.0, // top vertex
        -s, -s, 0.0, // bottom-left vertex
        s, -s, 0.0  // bottom-right vertex
    );

    this.triangleBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.triangleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.triangleArray), gl.STATIC_DRAW);

    var floatBytes = 4;
    this.positionAttribute = gl.getAttribLocation(shaderProgram, "vPosition");
    gl.vertexAttribPointer(this.positionAttribute, 3, gl.FLOAT, false, 3 * floatBytes, 0);
    gl.enableVertexAttribArray(this.positionAttribute);

    this.colorUniform = gl.getUniformLocation(shaderProgram, "vColor");

    this.modelMatrixUniform = gl.getUniformLocation(this.shaderProgram, "modelMat");
    this.viewMatrixUniform = gl.getUniformLocation(this.shaderProgram, "viewMat");
    this.projectionMatrixUniform = gl.getUniformLocation(this.shaderProgram, "projectionMat");
    gl.bindVertexArray(null)

    // before clicking on play, use the keyboard to move the ship
    canvas.addEventListener("keydown", function (e) {
        const keyActions = {
            90: () => moveForward(-moveValue), // z
            88: () => moveForward(moveValue), // x
            65: () => moveSideways(-moveValue), // a
            68: () => moveSideways(moveValue), // d
            87: () => moveUp(moveValue), // w
            83: () => moveUp(-moveValue), // s
            81: () => rotateShip(-rotateValue), // q
            69: () => rotateShip(rotateValue) // e
        };

        const action = keyActions[e.keyCode];
        if (action) {
            action();
        }

        console.log(e.keyCode);
    });

    function moveForward(delta) { currentForward += delta; }
    function moveSideways(delta) { currentSideways += delta; }
    function moveUp(delta) { currentUp += delta; }
    function rotateShip(delta) { currentRotation += delta; }
}

Ship.prototype.numVertices = 3; 
Ship.prototype.render = function (viewMatrix, projectionMatrix) {
    var gl = this.gl;
    gl.bindVertexArray(this.vertexArray);

    var modelMatrix = mat4();
    var rotationMatrix = rotateZ(currentRotation);
    modelMatrix = mult(rotationMatrix, modelMatrix);
    var forward = -(initialDistance + currentForward);

    modelMatrix = mat4(
        modelMatrix[0][0], modelMatrix[0][1], modelMatrix[0][2], modelMatrix[0][3] + currentSideways,
        modelMatrix[1][0], modelMatrix[1][1], modelMatrix[1][2], modelMatrix[1][3] + forward,
        modelMatrix[2][0], modelMatrix[2][1], modelMatrix[2][2], modelMatrix[2][3] + currentUp,
        modelMatrix[3][0], modelMatrix[3][1], modelMatrix[3][2], modelMatrix[3][3]
    );

    modelMatrix.matrix = true;
    gl.uniform3fv(this.colorUniform, flatten(vec3(1.0, 1.0, 1.0)));
    gl.uniformMatrix4fv(this.modelMatrixUniform, false, flatten(modelMatrix));
    gl.uniformMatrix4fv(this.viewMatrixUniform, false, flatten(mat4()));
    gl.uniformMatrix4fv(this.projectionMatrixUniform, false, flatten(projectionMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);
    gl.bindVertexArray(null);
};

function getViewMatrix() {
    var cx = (initialDistance + currentForward * 10);
    var cy = currentUp;
    var cz = currentSideways;
    var longitude = currentUp;
    var latitude = currentSideways;
    var radius = initialDistance + currentForward;
    var cx = radius * Math.cos(latitude * Math.PI / 180) * Math.cos(longitude * Math.PI / 180);
    var cy = radius * Math.cos(latitude * Math.PI / 180) * Math.sin(longitude * Math.PI / 180);
    var cz = radius * Math.sin(latitude * Math.PI / 180);
    var at = vec3(0, 0, 0);
    var up = vec3(0, 1, 0);
    var viewMatrix = lookAt(vec3(cx, cy, cz), at, up);
    return viewMatrix;
}

// Assignmnt 2: Damilare Olaniyan
"use strict";
function Ring(gl, shaderProgram, orbitDist, thickness, tiltDegree) {
    var ring = this;
    ring.gl = gl;
    ring.shaderProgram = shaderProgram;
    ring.ringSections = 100;
    ring.orbitDist = orbitDist / 20;
    ring.tiltDegree = radians(tiltDegree);
    var innerRadius = ring.orbitDist;
    var outerRadius = ring.orbitDist + thickness;
    ring.attachMat = [vec4(0, 0, 0, 0),
    vec4(0, 0, 0, 0),
    vec4(0, 0, 0, 0),
    vec4(0, 0, 0, 0)];
    ring.attachMat.matrix = true;
    ring.vertexArray = gl.createVertexArray();
    gl.bindVertexArray(ring.vertexArray);

    ring.vertices = [];

    var degree = 0.0;
    var degDiff = Math.PI / ring.ringSections;
    var tilt = -ring.tiltDegree;
    var tiltDiff = (ring.tiltDegree / ring.ringSections) * 2;
    for (var i = 0; i <= ring.ringSections; i++) {
        var sinD = Math.sin(degree);
        var cosD = Math.cos(degree);
        var sinT = Math.sin(tilt);
        var cosT = Math.cos(tilt);

        var innerX = cosT * cosD * innerRadius;
        var outerX = cosT * cosD * outerRadius;
        var innerY = sinT * innerRadius;
        var outerY = sinT * outerRadius;
        var innerZ = sinD * innerRadius;
        var outerZ = sinD * outerRadius;
        ring.vertices.push(vec3(innerX, innerY, innerZ));
        ring.vertices.push(vec3(outerX, outerY, outerZ));
        degree += degDiff;
        tilt += tiltDiff;
    }


    ring.transformedVertices = [];
    for (var i in ring.vertices) {
        var temp = ring.vertices[i];
        var temp = vec3(temp[0], temp[1], -temp[2]);
        ring.transformedVertices.push(temp);
    }
    for (var i in ring.transformedVertices) {
        ring.vertices.push(ring.transformedVertices[i]);
    }


    ring.ringBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ring.ringBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(ring.vertices), gl.STATIC_DRAW);

    var floatBytes = 4;
    ring.vertexPosition = gl.getAttribLocation(ring.shaderProgram, "vPosition");
    gl.vertexAttribPointer(ring.vertexPosition, 3, gl.FLOAT, false, 3 * floatBytes, 0);
    gl.enableVertexAttribArray(ring.vertexPosition);

    ring.vertexColor = gl.getUniformLocation(shaderProgram, "vColor");
    ring.modelMatrix = gl.getUniformLocation(ring.shaderProgram, "modelMat");
    ring.viewMatrix = gl.getUniformLocation(ring.shaderProgram, "viewMat");
    ring.projectionMatrix = gl.getUniformLocation(ring.shaderProgram, "projectionMat");
    ring.lightPosition = gl.getUniformLocation(shaderProgram, "lightPosition");
    ring.ambientFactor = gl.getUniformLocation(shaderProgram, "ambientFactor");
    gl.bindVertexArray(null);
};

Ring.prototype.render = function (viewMat, color, projectionMat, lightPosition, ambientFactor) {
    var gl = this.gl;
    gl.bindVertexArray(this.vertexArray);
    var modelMat = mat4();
    modelMat.matrix = true;
    modelMat = add(modelMat, this.attachMat);
    gl.uniformMatrix4fv(this.modelMatrix, false, flatten(modelMat));
    gl.uniformMatrix4fv(this.viewMatrix, false, flatten(viewMat));
    gl.uniformMatrix4fv(this.projectionMatrix, false, flatten(projectionMat));
    gl.uniform3fv(this.lightPosition, flatten(lightPosition));
    gl.uniform1f(this.ambientFactor, ambientFactor);
    gl.uniform3fv(this.vertexColor, flatten(vec3(1, 1, 1)));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.ringSections * 4 + 4);
    gl.bindVertexArray(null);
};

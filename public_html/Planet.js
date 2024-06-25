// Assignmnt 2: Damilare Olaniyan
"use strict";

function Planet(gl, shaderProgram, scale, image, dayPeriod, yearPeriod, orbitDist, axisTilt, orbitTilt) {
    var p = this;
    p.gl = gl;
    p.shaderProgram = shaderProgram;
    p.scale = scale / 40;
    p.image = image || vec4(1.0, 0.0, 0.0, 1.0); // Red color;
    p.orbitDist = orbitDist / 20;
    p.axisTilt = axisTilt;
    p.orbitTilt = orbitTilt;
    p.fixedDayPeriod = dayPeriod / 180;
    p.rotation = 0;
    p.fixedYearPeriod = yearPeriod / 50; 
    p.revolution = 0;
    p.modelMat = mat4();
    p.attachMat = [
        vec4(0, 0, 0, 0),
        vec4(0, 0, 0, 0),
        vec4(0, 0, 0, 0),
        vec4(0, 0, 0, 0)
    ];
    p.attachMat.matrix = true;

    p.vertexArray = gl.createVertexArray();
    gl.bindVertexArray(p.vertexArray);

    p.vertices = [];
    p.normals = [];
    p.texCoords = [];

    p.latitudeSec = 100;
    p.longitudeSec = 100;

    var latitudeTexSpace = 1.0 / p.latitudeSec;
    var longitudeTexSpace = 1.0 / (p.longitudeSec + 1);

    var latAng = 0,
        latDiff = (2 * Math.PI) / p.latitudeSec;
    var loDiff = Math.PI / p.longitudeSec,
        loAng = Math.PI / 2 - loDiff;

    var pole = vec3(0, p.scale, 0),
        poleN = normalize(vec3(0, 0, 0));
    p.vertices.push(pole);
    p.texCoords.push(vec2(0, 1));
    p.normals.push(poleN);
    var currentLatVerts = [];
    var lastLatVerts = [];
    var currentTC = [];
    var lastTC = [];

    for (var lo = 0; lo < p.longitudeSec - 1; lo++) {
        var sinLo = Math.sin(loAng);
        var cosLo = Math.cos(loAng);
        var pointCount = 1;
        for (var lat = 0; lat < p.latitudeSec; lat++) {
            var sinLat = Math.sin(latAng);
            var cosLat = Math.cos(latAng);

            var texX = lat * latitudeTexSpace;
            var texY = 1.0 - (lo + 1) * longitudeTexSpace;

            var x = sinLat * cosLo * p.scale;
            var y = sinLo * p.scale;
            var z = cosLat * cosLo * p.scale;

            var vt = vec3(x, y, z),
                vtN = normalize(vec3(x, 0, z));
            var tc = vec2(texX, texY);
            if ((lat == 0 || lat == 1) && lo == 0) {
                p.vertices.push(vt);
                p.texCoords.push(tc);
                p.normals.push(vtN);
            } else if (lo == 0) {
                p.vertices.push(pole);
                p.texCoords.push(vec2(0, 1));
                p.vertices.push(vt);
                p.texCoords.push(tc);
                p.normals.push(poleN);
                p.normals.push(vtN);
            } else if (lat == 0) {
                var lastvt = lastLatVerts[pointCount],
                    lastvtN = normalize(vec3(lastvt[0], 0, lastvt[2]));
                var lasttc = lastTC[pointCount];
                pointCount++;
                p.vertices.push(lastvt);
                p.texCoords.push(lasttc);
                p.vertices.push(vt);
                p.texCoords.push(tc);
                p.normals.push(lastvtN);
                p.normals.push(vtN);
            } else if (lat == 1) {
                p.vertices.push(vt);
                p.texCoords.push(tc);
            } else if (lat != p.latitudeSec - 1) {
                var lastvt = lastLatVerts[pointCount],
                    lastvtN = normalize(vec3(lastvt[0], 0, lastvt[2]));
                var lasttc = lastTC[pointCount];
                pointCount++;
                p.vertices.push(lastvt);
                p.texCoords.push(lasttc);
                p.vertices.push(vt);
                p.texCoords.push(tc);
                p.normals.push(lastvtN);
                p.normals.push(vtN);
            } else {
                var lastvt = lastLatVerts[0],
                    lastvtN = normalize(vec3(lastvt[0], 0, lastvt[2]));
                var lasttc = lastTC[0];
                p.vertices.push(lastvt);
                p.texCoords.push(lasttc);
                p.vertices.push(vt);
                p.texCoords.push(tc);
                p.normals.push(lastvtN);
                p.normals.push(vtN);
            }
            currentLatVerts.push(vt);
            currentTC.push(tc);
            latAng += latDiff;
        }
        loAng -= loDiff;
        lastLatVerts = currentLatVerts;
        lastTC = currentTC;
        currentTC = [];
        currentLatVerts = [];
    }

    var pole2 = vec3(0, -p.scale, 0),
        pole2N = normalize(vec3(0, 0, 0));
    for (var a = 0; a < lastLatVerts.length; a++) {
        var lastv = lastLatVerts[a],
            lastvN = normalize(vec3(lastv[0], 0, lastv[2]));
        var lasttc = lastTC[a];
        p.vertices.push(lastv);
        p.texCoords.push(lasttc);
        p.vertices.push(pole2);
        p.texCoords.push(vec2(0, 0));
        p.normals.push(lastvN);
        p.normals.push(pole2N);
    }

    var floatBytes = 4;
    p.sphereBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, p.sphereBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(p.vertices), gl.STATIC_DRAW);

    p.vPosition = gl.getAttribLocation(p.shaderProgram, "vPosition");
    gl.vertexAttribPointer(p.vPosition, 3, gl.FLOAT, false, 3 * floatBytes, 0);
    gl.enableVertexAttribArray(p.vPosition);

    p.sphereNormal = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, p.sphereNormal);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(p.normals), gl.STATIC_DRAW);

    p.vNormal = gl.getAttribLocation(p.shaderProgram, "vNormal");
    gl.vertexAttribPointer(p.vNormal, 3, gl.FLOAT, false, 3 * floatBytes, 0);
    gl.enableVertexAttribArray(p.vNormal);

    p.modelMatrixLocation = gl.getUniformLocation(p.shaderProgram, "modelMat");
    p.viewMatrixLocation = gl.getUniformLocation(p.shaderProgram, "viewMat");
    p.projectionMatrixLocation = gl.getUniformLocation(p.shaderProgram, "projectionMat");

    p.lightPosition = gl.getUniformLocation(p.shaderProgram, "lightPosition");
    p.ambientFactor = gl.getUniformLocation(p.shaderProgram, "ambientFactor");
    p.vColor = gl.getUniformLocation(p.shaderProgram, "vColor");


    p.tex = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, p.tex);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(p.texCoords), gl.STATIC_DRAW);

    p.vTexCoord = gl.getAttribLocation(p.shaderProgram, "vTexCoord");
    gl.vertexAttribPointer(p.vTexCoord, 2, gl.FLOAT, false, 2 * floatBytes, 0);
    gl.enableVertexAttribArray(p.vTexCoord);

    p.fTexSampler = gl.getUniformLocation(p.shaderProgram, "fTexSampler");
    p.InitTexture(p.image);
    
    gl.bindVertexArray(null);
}

Planet.prototype.render = function (flag, viewMat, projectionMat, lightPosition, ambientFactor) {
    var gl = this.gl;
    gl.bindVertexArray(this.vertexArray);
    var modelMat = mat4();
    if (flag) {
        this.rotation += this.fixedDayPeriod;
        this.revolution += this.fixedYearPeriod;
    }
    modelMat.matrix = true;
    var rotate1 = rotateY(this.rotation);
    var rotate2 = rotateZ(-this.axisTilt);
    modelMat = mult(rotate1, modelMat);
    modelMat = mult(rotate2, modelMat);

    modelMat = [
        vec4(modelMat[0][0], modelMat[0][1], modelMat[0][2], modelMat[0][3] + this.orbitDist),
        vec4(modelMat[1]),
        vec4(modelMat[2]),
        vec4(modelMat[3])
    ];
    modelMat.matrix = true;
    var revolute1 = rotateY(this.revolution);
    var revolute2 = rotateZ(this.orbitTilt);
    modelMat = mult(revolute1, modelMat);
    modelMat = mult(revolute2, modelMat);

    modelMat = add(this.attachMat, modelMat);

    gl.uniformMatrix4fv(this.modelMatrixLocation, false, flatten(modelMat));
    gl.uniformMatrix4fv(this.viewMatrixLocation, false, flatten(viewMat));
    gl.uniformMatrix4fv(this.projectionMatrixLocation, false, flatten(projectionMat));
    gl.uniform3fv(this.lightPosition, flatten(lightPosition));
    gl.uniform1f(this.ambientFactor, ambientFactor);
    gl.uniform3fv(this.vColor, flatten(vec3(1, 1, 1)));


    if (this.textureLoaded) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this.fTexSampler, 0);
    }

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.latitudeSec * 2 * (this.longitudeSec - 1) + 2);
    gl.bindVertexArray(null);
};


Planet.prototype.InitTexture = function (image) {
    var gl = this.gl;

    this.whiteTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.whiteTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
                  gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));

    var texture = this.texture = gl.createTexture();
    var textureImage = new Image();
    var t = this;
    t.textureLoaded = false;
    textureImage.onload = function () {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      
        gl.generateMipmap(gl.TEXTURE_2D);
        t.textureLoaded = true;
    }

    textureImage.src = image; 
}

function attachMoon(centerPlanet, moonPlanet) {
    moonPlanet.attachMat = [
        vec4(0, 0, 0, centerPlanet.orbitDist),
        vec4(0, 0, 0, 0),
        vec4(0, 0, 0, 0),
        vec4(0, 0, 0, 0)
    ];
    moonPlanet.attachMat.matrix = true;
    var revolute1 = rotateY(centerPlanet.revolution);
    var revolute2 = rotateZ(centerPlanet.orbitTilt);
    moonPlanet.attachMat = mult(revolute1, moonPlanet.attachMat);
    moonPlanet.attachMat = mult(revolute2, moonPlanet.attachMat);
}

function attachRing(planet, ring) {
    ring.attachMat = [
        vec4(0, 0, 0, planet.orbitDist),
        vec4(0, 0, 0, 0),
        vec4(0, 0, 0, 0),
        vec4(0, 0, 0, 0)
    ];
    ring.attachMat.matrix = true;
    var revolute1 = rotateY(planet.revolution);
    var revolute2 = rotateZ(planet.orbitTilt);
    ring.attachMat = mult(revolute1, ring.attachMat);
    ring.attachMat = mult(revolute2, ring.attachMat);
}
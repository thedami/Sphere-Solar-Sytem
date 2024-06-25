#version 300 es

in vec3 vPosition;         
in vec3 vNormal;
in vec2 vTexCoord;
uniform vec3 vColor;    
// We need to separate projection and and location so we can put points into view/camera
//   coordinates to do lighting calculations
uniform mat4 projectionMat;   
uniform mat4 viewMat;         
uniform mat4 modelMat;        

// Light info
uniform vec3 lightPosition; 
uniform float ambientFactor;


out vec3 fColor;            
out vec2 fTexCoord;

void main() {
    vec4 posVC4 = viewMat * modelMat * vec4(vPosition.xyz, 1.0); 
    vec4 normVC4 = viewMat * modelMat * vec4(vNormal.xyz, 0.0);
    vec4 lightVC4 = viewMat * vec4(lightPosition.xyz, 1.0);
    
    vec3 normVC3 = normalize(normVC4.xyz); 
    vec3 posVC3 = posVC4.xyz;
    vec3 lightVC3 = lightVC4.xyz;
    
    vec3 ambientComponent = ambientFactor * vColor;
    vec3 L = normalize(lightVC3-posVC3); //point light
    vec3 diffuseComponent = vColor * dot(L, normVC3);
    vec3 phong = ambientComponent + diffuseComponent;
    
    gl_Position = projectionMat * posVC4; //viewMat * modelMat* vec4(vPosition, 1.0); 
    fColor = phong;         
    fTexCoord = vTexCoord;
}

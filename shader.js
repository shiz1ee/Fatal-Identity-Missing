const canvas = document.getElementById("torch");
const gl = canvas.getContext("webgl");

const vertSrc = `
attribute vec2 a_pos;
void main() {
 gl_Position = vec4(a_pos, 0.0, 1.0);
 }` ;

 const fragSrc = `
 precision mediump float;
 uniform vec2 u_res;
 uniform vec2 u_mouse;
 uniform float u_time;
 uniform float u_red;

 
 void main() {
 //torch
 float d = distance(gl_FragCoord.xy, u_mouse);
 float halo = smoothstep(110.0, 0.0, d);
 float core = smoothstep(30.0, 0.0, d);
 float flicker = 0.91 + 0.07 * sin(u_time * 10.0) + 0.04 * sin(u_time * 27.0);
 vec3 warm = vec3(1.0, 0.6, 0.2) * (halo * 0.35 + core * 0.31) * flicker;

 gl_FragColor = vec4(warm, 1.0);
 }`;

 function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
    }
    return s;
 }

 const prog = gl.createProgram();
 gl.attachShader(prog, compile(gl.VERTEX_SHADER, vertSrc));
 gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fragSrc));
 gl.linkProgram(prog);
 gl.useProgram(prog);

 const buf = gl.createBuffer();
 gl.bindBuffer(gl.ARRAY_BUFFER, buf);
 gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1, -1,1, 1,-1]), gl.STATIC_DRAW);
 const aPos = gl.getAttribLocation(prog, "a_pos");
 gl.enableVertexAttribArray(aPos);
 gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0 );

 const uRes = gl.getUniformLocation(prog, "u_res");
 const uMouse = gl.getUniformLocation(prog, "u_mouse");
 const uRed = gl.getUniformLocation(prog, "u_red");
 let redLevel = 0;
 const uTime = gl.getUniformLocation(prog, "u_time");

 let mouse = [0, 0];

 function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
 }
 window.addEventListener("resize", resize);
 resize();

 window.addEventListener("mousemove", (e) => {
    mouse = [e.clientX, window.innerHeight - e.clientY];
 });

 function render(t) {
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform2f(uMouse, mouse[0], mouse[1]);
    gl.uniform1f(uTime, t/ 1000);
    gl.uniform1f(uRed, redLevel);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
 }
 requestAnimationFrame(render);

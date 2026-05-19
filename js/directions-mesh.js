/**
 * Soft mesh gradient for «Направления» — vanilla WebGL, editorial palette.
 * Inspired by mesh-gradient shaders; adapted for static site.
 */
(function () {
  "use strict";

  var canvas = document.getElementById("directions-mesh-canvas");
  var wrap = document.getElementById("directions-mesh-wrap");
  if (!canvas || !wrap) return;

  var prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: false,
    antialias: false,
    powerPreference: "low-power"
  });

  if (!gl) {
    wrap.classList.add("directions__mesh-wrap--fallback");
    return;
  }

  var vertSrc =
    "attribute vec2 aPos;" +
    "void main(){gl_Position=vec4(aPos,0.0,1.0);}";

  var fragSrc =
    "precision highp float;" +
    "uniform float uTime;" +
    "uniform vec2 uResolution;" +
    "uniform float uStatic;" +
    "float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}" +
    "float noise(vec2 p){" +
    "vec2 i=floor(p);vec2 f=fract(p);" +
    "f=f*f*(3.0-2.0*f);" +
    "float a=hash(i);float b=hash(i+vec2(1.0,0.0));" +
    "float c=hash(i+vec2(0.0,1.0));float d=hash(i+vec2(1.0,1.0));" +
    "return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);" +
    "}" +
    "float fbm(vec2 p){" +
    "float v=0.0;float a=0.5;" +
    "for(int i=0;i<4;i++){v+=a*noise(p);p*=2.1;a*=0.5;}" +
    "return v;" +
    "}" +
    "void main(){" +
    "vec2 uv=gl_FragCoord.xy/uResolution;" +
    "vec2 p=uv*1.08-0.04;" +
    "float t=uStatic>0.5?0.0:uTime*0.11;" +
    "vec2 q=vec2(" +
    "fbm(p*1.35+vec2(t*0.3,t*0.2))-0.5," +
    "fbm(p*1.35+vec2(4.2+t*0.25,1.8))-0.5" +
    ")*0.12;" +
    "p+=q;" +
    "vec3 cIvory=vec3(0.953,0.937,0.910);" +
    "vec3 cSand=vec3(0.910,0.871,0.824);" +
    "vec3 cTaupe=vec3(0.867,0.824,0.773);" +
    "vec3 cSage=vec3(0.482,0.518,0.439);" +
    "vec3 cMoss=vec3(0.365,0.408,0.282);" +
    "vec3 cGrey=vec3(0.722,0.690,0.651);" +
    "vec2 p0=vec2(0.22+0.07*sin(t),0.38+0.06*cos(t*0.85));" +
    "vec2 p1=vec2(0.78+0.06*cos(t*0.9),0.32+0.07*sin(t*1.05));" +
    "vec2 p2=vec2(0.58+0.08*sin(t*0.75),0.74+0.05*cos(t*0.95));" +
    "vec2 p3=vec2(0.12+0.05*cos(t*1.15),0.62+0.07*sin(t*0.7));" +
    "vec2 p4=vec2(0.88+0.05*sin(t*0.55),0.58+0.06*cos(t*0.88));" +
    "vec2 p5=vec2(0.42+0.06*cos(t*0.65),0.18+0.04*sin(t*0.8));" +
    "float d0=length(p-p0);float d1=length(p-p1);float d2=length(p-p2);" +
    "float d3=length(p-p3);float d4=length(p-p4);float d5=length(p-p5);" +
    "float w0=1.0/(d0*d0*7.5+0.09);" +
    "float w1=1.0/(d1*d1*7.5+0.09);" +
    "float w2=1.0/(d2*d2*7.5+0.09);" +
    "float w3=1.0/(d3*d3*7.5+0.09);" +
    "float w4=1.0/(d4*d4*7.5+0.09);" +
    "float w5=1.0/(d5*d5*7.5+0.09);" +
    "float wSum=w0+w1+w2+w3+w4+w5;" +
    "vec3 col=(cIvory*w0+cSand*w1+cSage*w2+cMoss*w3+cGrey*w4+cTaupe*w5)/wSum;" +
    "float mist=fbm(p*3.2+vec2(t*0.15))*(0.06+0.02*sin(t*0.5));" +
    "col=mix(col,cIvory,mist*0.55);" +
    "col=mix(col,cSand,0.08);" +
    "float vig=smoothstep(1.15,0.35,length(uv-0.5));" +
    "col=mix(col,cTaupe*0.95,0.12*(1.0-vig));" +
    "gl_FragColor=vec4(col,1.0);" +
    "}";

  function compile(type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn("directions-mesh shader:", gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  var vs = compile(gl.VERTEX_SHADER, vertSrc);
  var fs = compile(gl.FRAGMENT_SHADER, fragSrc);
  if (!vs || !fs) {
    wrap.classList.add("directions__mesh-wrap--fallback");
    return;
  }

  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    wrap.classList.add("directions__mesh-wrap--fallback");
    return;
  }

  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );

  var aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  var uTime = gl.getUniformLocation(prog, "uTime");
  var uResolution = gl.getUniformLocation(prog, "uResolution");
  var uStatic = gl.getUniformLocation(prog, "uStatic");

  var running = !prefersReduced;
  var visible = true;
  var start = performance.now();
  var rafId = 0;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var rect = wrap.getBoundingClientRect();
    var w = Math.max(1, Math.floor(rect.width * dpr));
    var h = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      gl.viewport(0, 0, w, h);
    }
  }

  function draw(now) {
    if (!visible) return;
    var t = (now - start) * 0.001;
    gl.uniform1f(uTime, t);
    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.uniform1f(uStatic, prefersReduced ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function loop(now) {
    if (!running) return;
    resize();
    draw(now);
    rafId = requestAnimationFrame(loop);
  }

  function startLoop() {
    if (running && !rafId) {
      rafId = requestAnimationFrame(loop);
    }
  }

  function stopLoop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  resize();
  draw(performance.now());

  if (running) {
    startLoop();
  }

  window.addEventListener("resize", function () {
    resize();
    if (!running) draw(performance.now());
  });

  var section = document.getElementById("directions");
  if (section && "IntersectionObserver" in window) {
    var visIo = new IntersectionObserver(
      function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && running) startLoop();
        else stopLoop();
      },
      { rootMargin: "80px 0px", threshold: 0.02 }
    );
    visIo.observe(section);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stopLoop();
    else if (running && visible) startLoop();
  });
})();

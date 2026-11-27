const root = document.documentElement;
const canvas = document.querySelector<HTMLCanvasElement>("#field");
if (!canvas || !root.classList.contains("lens-ready")) {
  /* Text stays clear. Nothing else to start. */
} else {
  const glyphs = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄ01ABCDEF#<>/{}░▒╱╲╳◇◆";
  const reveals = [...document.querySelectorAll<HTMLElement>(".reveal")];
  let lensX = innerWidth / 2;
  let lensY = innerHeight * 0.4;
  let targetX = lensX;
  let targetY = lensY;
  let auto = matchMedia("(pointer: coarse)").matches;
  let clock = 0;
  let visible = true;
  let raf = 0;
  const coarse = matchMedia("(pointer: coarse)");

  const resolved = () => root.classList.contains("resolved");
  const settle = () => root.classList.add("resolved");

  addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    targetX = e.clientX;
    targetY = e.clientY;
    auto = false;
  }, { passive: true });

  addEventListener("focusin", (e) => {
    const el = e.target;
    if (!(el instanceof Element) || el.closest("#palette")) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;
    targetX = rect.left + rect.width / 2;
    targetY = rect.top + rect.height / 2;
    auto = false;
  });

  addEventListener("scroll", () => {
    if (scrollY > 40) settle();
  }, { passive: true });

  addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "Shift" || e.key === "Tab") return;
    settle();
  });

  window.setTimeout(settle, 2000);

  function place() {
    if (auto && !resolved()) {
      clock += 0.012;
      targetX = innerWidth / 2 + Math.cos(clock) * innerWidth * 0.18;
      targetY = innerHeight * 0.42 + Math.sin(clock * 1.3) * innerHeight * 0.08;
    }
    lensX += (targetX - lensX) * 0.14;
    lensY += (targetY - lensY) * 0.14;
    root.style.setProperty("--x", `${lensX}px`);
    root.style.setProperty("--y", `${lensY}px`);
    if (!resolved()) {
      for (const el of reveals) {
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${lensX - rect.left}px`);
        el.style.setProperty("--my", `${lensY - rect.top}px`);
      }
    }
  }

  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    premultipliedAlpha: false,
    powerPreference: "low-power",
  });

  let draw: () => void = () => {};

  if (gl) {
    const vsSource = `#version 300 es
void main(){
  vec2 p=vec2(float((gl_VertexID<<1)&2), float(gl_VertexID&2));
  gl_Position=vec4(p*2.0-1.0,0.0,1.0);
}`;
    const fsSource = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform vec2 uLens;
uniform float uRadius;
uniform float uTime;
uniform float uAlpha;
uniform float uCount;
uniform float uCell;
uniform vec2 uGrid;
uniform sampler2D uAtlas;
out vec4 o;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
  vec2 frag=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y);
  float cell=uCell;
  vec2 id=floor(frag/cell);
  float d=distance(frag,uLens);
  if(d<uRadius) discard;
  float h=hash(id);
  float tick=floor(uTime*0.7);
  float flick=step(0.985,hash(id+tick));
  float idx=floor(hash(id+tick*flick)*uCount);
  float col=mod(idx,uGrid.x);
  float row=floor(idx/uGrid.x);
  vec2 uv=(frag-id*cell)/cell;
  vec2 atlasUV=(vec2(col,row)+uv)/uGrid;
  float g=texture(uAtlas,vec2(atlasUV.x,1.0-atlasUV.y)).a;
  if(g<0.08) discard;
  float edge=smoothstep(uRadius+48.0,uRadius,d);
  vec3 cyan=vec3(0.235,0.941,1.0);
  vec3 violet=vec3(0.659,0.333,0.969);
  o=vec4(mix(cyan,violet,edge), g*uAlpha*(0.4+0.6*h));
}`;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
    };
    const vert = compile(gl.VERTEX_SHADER, vsSource);
    const frag = compile(gl.FRAGMENT_SHADER, fsSource);
    const program = vert && frag ? gl.createProgram() : null;
    if (program && vert && frag) {
      gl.attachShader(program, vert);
      gl.attachShader(program, frag);
      gl.linkProgram(program);
    }
    const linked = program && gl.getProgramParameter(program, gl.LINK_STATUS);

    if (program && linked) {
      const cols = 8;
      const rows = Math.ceil(glyphs.length / cols);
      const cellPx = 32;
      const atlas = document.createElement("canvas");
      atlas.width = cols * cellPx;
      atlas.height = rows * cellPx;
      const ag = atlas.getContext("2d");
      const paintAtlas = () => {
        if (!ag) return;
        ag.clearRect(0, 0, atlas.width, atlas.height);
        ag.fillStyle = "#fff";
        ag.font = "20px 'JetBrains Mono', ui-monospace, monospace";
        ag.textAlign = "center";
        ag.textBaseline = "middle";
        for (let i = 0; i < glyphs.length; i++) {
          ag.fillText(glyphs[i], (i % cols) * cellPx + cellPx / 2, Math.floor(i / cols) * cellPx + cellPx / 2 + 1);
        }
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
      };
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      paintAtlas();
      document.fonts?.ready.then(paintAtlas).catch(() => {});

      const loc = (name: string) => gl.getUniformLocation(program, name);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(program);
      gl.uniform1i(loc("uAtlas"), 0);
      gl.uniform2f(loc("uGrid"), cols, rows);
      gl.uniform1f(loc("uCount"), glyphs.length);
      gl.uniform1f(loc("uCell"), 18);

      draw = () => {
        const dpr = Math.min(devicePixelRatio || 1, 2);
        const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
        const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
        gl.viewport(0, 0, width, height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        const rect = canvas.getBoundingClientRect();
        const radius = (resolved() ? 36 : 130) * dpr;
        gl.uniform2f(loc("uRes"), width, height);
        gl.uniform2f(loc("uLens"), (lensX - rect.left) * dpr, (lensY - rect.top) * dpr);
        gl.uniform1f(loc("uRadius"), radius);
        gl.uniform1f(loc("uCell"), 18 * dpr);
        gl.uniform1f(loc("uTime"), clock);
        gl.uniform1f(loc("uAlpha"), resolved() ? 0.22 : 0.55);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };
      canvas.addEventListener("webglcontextlost", (event) => event.preventDefault());
    }
  } else {
    draw = draw2d();
  }

  function draw2d() {
    const ctx = canvas.getContext("2d");
    if (!ctx) return () => {};
    const colsMax = 96;
    const rowsMax = 64;
    const cells = new Uint8Array(colsMax * rowsMax);
    for (let i = 0; i < cells.length; i++) cells[i] = (Math.random() * glyphs.length) | 0;
    return () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      const width = Math.max(1, Math.floor(cssW * dpr));
      const height = Math.max(1, Math.floor(cssH * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.font = "13px 'JetBrains Mono', ui-monospace, monospace";
      const rect = canvas.getBoundingClientRect();
      const lx = lensX - rect.left;
      const ly = lensY - rect.top;
      const radius = resolved() ? 36 : 130;
      const alpha = resolved() ? 0.16 : 0.4;
      const cell = 18;
      const cols = Math.min(colsMax, Math.ceil(cssW / cell));
      const rows = Math.min(rowsMax, Math.ceil(cssH / cell));
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = j * colsMax + i;
          if (Math.random() < 0.012) cells[k] = (Math.random() * glyphs.length) | 0;
          const x = i * cell;
          const y = j * cell + 13;
          const dist = Math.hypot(x - lx, y - ly);
          if (dist < radius) continue;
          const edge = dist < radius + 40;
          ctx.fillStyle = edge ? "rgba(168,85,247,0.7)" : `rgba(60,240,255,${alpha})`;
          ctx.fillText(glyphs[cells[k]], x, y);
        }
      }
    };
  }

  new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true;
  }).observe(canvas);

  const frame = () => {
    raf = requestAnimationFrame(frame);
    if (document.hidden || root.classList.contains("calm")) return;
    if (coarse.matches) auto = auto || !resolved();
    place();
    if (visible) draw();
  };
  const start = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });
  start();
}

import { createWildlifeMesh, poseWildlife } from "./wildlife-rig";
import type { WildlifeKind } from "./wildlife-motion";

export const WILDLIFE_PADDING = .16;

// One small indexed mesh, one texture and one draw per visitor. The original
// RGBA sprite stays intact; the GPU animates its joints without bitmap edits.
export function createWildlifeRenderer(canvas: HTMLCanvasElement, image: HTMLImageElement, kind: WildlifeKind) {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true, depth: false, stencil: false });
  if (!gl) return null;
  const shaders: WebGLShader[] = [], buffers: WebGLBuffer[] = [];
  let program: WebGLProgram | null = null, texture: WebGLTexture | null = null;
  const dispose = () => {
    buffers.forEach(buffer => gl.deleteBuffer(buffer));
    shaders.forEach(shader => gl.deleteShader(shader));
    gl.deleteProgram(program); gl.deleteTexture(texture);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };
  try {
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Shader unavailable");
      shaders.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error("Shader unavailable");
      return shader;
    };
    program = gl.createProgram();
    if (!program) throw new Error("Program unavailable");
    gl.attachShader(program, compile(gl.VERTEX_SHADER, `
      attribute vec2 position; attribute vec2 uv; varying vec2 textureUV; uniform vec2 imageFit;
      void main() {
        vec2 fitted = position * imageFit + vec2((1.0 - imageFit.x) / 2.0, 1.0 - imageFit.y);
        vec2 p = (fitted + ${WILDLIFE_PADDING}) / ${1 + WILDLIFE_PADDING * 2};
        gl_Position = vec4(p.x * 2.0 - 1.0, 1.0 - p.y * 2.0, 0.0, 1.0);
        textureUV = uv;
      }`));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, `
      precision mediump float; varying vec2 textureUV; uniform sampler2D sprite;
      void main() { gl_FragColor = texture2D(sprite, textureUV); }`));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Program unavailable");
    gl.useProgram(program);
    const mesh = createWildlifeMesh(kind), positions = new Float32Array(mesh.coordinates.length);
    const attribute = (name: string, data: Float32Array, usage: number) => {
      const buffer = gl.createBuffer();
      if (!buffer) throw new Error("Buffer unavailable");
      buffers.push(buffer); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, data, usage);
      const location = gl.getAttribLocation(program!, name);
      gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
      return buffer;
    };
    const moving = attribute("position", mesh.coordinates, gl.DYNAMIC_DRAW);
    attribute("uv", mesh.coordinates, gl.STATIC_DRAW);
    const indexBuffer = gl.createBuffer();
    if (!indexBuffer) throw new Error("Buffer unavailable");
    buffers.push(indexBuffer); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);
    texture = gl.createTexture();
    if (!texture) throw new Error("Texture unavailable");
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(gl.getUniformLocation(program, "sprite"), 0);
    const imageFit = gl.getUniformLocation(program, "imageFit");
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    return {
      draw(seconds: number, progress: number) {
        if (gl.isContextLost()) return false;
        poseWildlife(mesh, kind, seconds, progress, positions);
        const aspect = (image.naturalWidth / image.naturalHeight) / (canvas.width / canvas.height);
        gl.uniform2f(imageFit, Math.min(1, aspect), Math.min(1, 1 / aspect));
        gl.viewport(0, 0, canvas.width, canvas.height); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindBuffer(gl.ARRAY_BUFFER, moving); gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions);
        gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0);
        return true;
      },
      dispose,
    };
  } catch {
    dispose();
    return null; // The ordinary transparent sprite remains a usable fallback.
  }
}

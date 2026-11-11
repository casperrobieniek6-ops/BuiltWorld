# Built World

A five-round quiz about architecture, infrastructure, and urban planning.

Run `python3 -m http.server 8000` from the repository root and open `http://localhost:8000` in a browser. The 3D globe uses Three.js, with a Canvas fallback when WebGL is unavailable. There is no build step.

The cover and round photo slots are placeholders. Globe land geometry is based on Natural Earth 1:110m data via [World Atlas](https://github.com/topojson/world-atlas). Three.js is distributed under the [MIT license](globe/THREE-LICENSE.txt).

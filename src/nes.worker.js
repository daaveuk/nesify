var diff = require('color-diff');
var canvasWebWorker = require('canvas-webworker');
var _ = require('lodash');
var Canvas = canvasWebWorker.Canvas;
var Image = canvasWebWorker.Image;

const palette = [
  { R: 124, G: 124, B: 124 },
  { R: 0, G: 0, B: 252 },
  { R: 0, G: 0, B: 188 },
  { R: 68, G: 40, B: 188 },
  { R: 148, G: 0, B: 132 },
  { R: 168, G: 0, B: 32 },
  { R: 168, G: 16, B: 0 },
  { R: 136, G: 20, B: 0 },
  { R: 80, G: 48, B: 0 },
  { R: 0, G: 120, B: 0 },
  { R: 0, G: 104, B: 0 },
  { R: 0, G: 88, B: 0 },
  { R: 0, G: 64, B: 88 },
  { R: 0, G: 0, B: 0 },
  { R: 0, G: 0, B: 0 },
  { R: 0, G: 0, B: 0 },
  { R: 188, G: 188, B: 188 },
  { R: 0, G: 120, B: 248 },
  { R: 0, G: 88, B: 248 },
  { R: 104, G: 68, B: 252 },
  { R: 216, G: 0, B: 204 },
  { R: 228, G: 0, B: 88 },
  { R: 248, G: 56, B: 0 },
  { R: 228, G: 92, B: 16 },
  { R: 172, G: 124, B: 0 },
  { R: 0, G: 184, B: 0 },
  { R: 0, G: 168, B: 0 },
  { R: 0, G: 168, B: 68 },
  { R: 0, G: 136, B: 136 },
  { R: 0, G: 0, B: 0 },
  { R: 248, G: 248, B: 248 },
  { R: 60, G: 188, B: 252 },
  { R: 104, G: 136, B: 252 },
  { R: 152, G: 120, B: 248 },
  { R: 248, G: 120, B: 248 },
  { R: 248, G: 88, B: 152 },
  { R: 248, G: 120, B: 88 },
  { R: 252, G: 160, B: 68 },
  { R: 248, G: 184, B: 0 },
  { R: 184, G: 248, B: 24 },
  { R: 88, G: 216, B: 84 },
  { R: 88, G: 248, B: 152 },
  { R: 0, G: 232, B: 216 },
  { R: 120, G: 120, B: 120 },
  { R: 252, G: 252, B: 252 },
  { R: 164, G: 228, B: 252 },
  { R: 184, G: 184, B: 248 },
  { R: 216, G: 184, B: 248 },
  { R: 248, G: 184, B: 248 },
  { R: 248, G: 164, B: 192 },
  { R: 240, G: 208, B: 176 },
  { R: 252, G: 224, B: 168 },
  { R: 248, G: 216, B: 120 },
  { R: 216, G: 248, B: 120 },
  { R: 184, G: 248, B: 184 },
  { R: 184, G: 248, B: 216 },
  { R: 0, G: 252, B: 252 },
  { R: 248, G: 216, B: 248 },
  { R: 255, G: 0, B: 0 },
  { R: 0, G: 255, B: 0 },
  { R: 0, G: 0, B: 255 }
];

onmessage = (e) => {
  let source = e.data[0];
  let thread = e.data[1];
  let imageData = _.chunk(source.data, 4);
  for (let i = 0; i < imageData.length; i++) {
    let pixel = imageData[i];
    let palColor = { R: pixel[0], B: pixel[1], G: pixel[2] };
    let pal = diff.closest(palColor, palette);
    pixel[0] = pal.R;
    pixel[1] = pal.G;
    pixel[2] = pal.B;
    pixel[3] = 255;
  }

  imageData = _.flatten(imageData);
  const typedArray = Uint8ClampedArray.from(imageData);
  let image = new ImageData(typedArray, source.width, source.height);

  self.postMessage([ 'imageData', image, thread ]);
};

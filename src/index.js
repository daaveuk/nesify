var diff = require('color-diff');
import Worker from './nes.worker.js';
const threads = 32;
const nesWorker = new Worker();
var _ = require('lodash');

document.addEventListener('DOMContentLoaded', (event) => {
  let output = document.getElementById('output');
  let source = document.getElementById('source');
  let button = document.getElementById('button');
  let saveButton = document.getElementById('saveButton');
  const ctx = output.getContext('2d');
  const multiplier = 2;
  const imageCanvas = document.createElement('canvas');
  const imageCTX = imageCanvas.getContext('2d');

  source.addEventListener('load', (e) => {
    output.height = source.clientHeight;
    output.width = source.clientWidth;
    imageCanvas.height = source.clientHeight;
    imageCanvas.width = source.clientWidth;
    imageCTX.drawImage(source, 0, 0);
    //nesify(source, ctx);
  });

  button.addEventListener('click', (e) => {
    let imageData = imageCTX.getImageData(0, 0, source.width, source.height);

    sendImageToThreads(imageData);
  });

  saveButton.addEventListener('click', (e) => {
    var image = output.toDataURL('image/png').replace('image/png', 'image/octet-stream'); // here is the most important part because if you dont replace you will get a DOM 18 exception.
    window.location.href = image;
  });

  const sendImageToThreads = (imageData) => {
    for (let th = 0; th < threads; th++) {
      let nesWorker = new Worker();
      let splitCanvas = document.createElement('canvas');
      let splitCTX = splitCanvas.getContext('2d');
      let threadCanvas = document.createElement('canvas');
      let threadCTX = threadCanvas.getContext('2d');
      let quadrantW = imageData.width / threads;
      let quadrantXStart = Math.round(quadrantW * th + 1);
      let quadrantXEnd = Math.round(imageData.width / threads);
      if (quadrantW * th === 0) {
        quadrantXStart = Math.round(quadrantW * th);
      }
      let mWidth = Math.round(quadrantW / multiplier);
      let mHeight = Math.round(imageData.height / multiplier);
      splitCanvas.width = quadrantW;
      splitCanvas.height = imageData.height;
      threadCanvas.width = mWidth;
      threadCanvas.height = mHeight;
      let quadImageData = imageCTX.getImageData(quadrantXStart, 0, quadrantXEnd, imageData.height);

      splitCTX.putImageData(quadImageData, 0, 0);

      const debugContainer = document.getElementById('debug');
      //debugCanvas.width = mWidth;
      //debugCanvas.height = mHeight;

      threadCTX.drawImage(splitCanvas, 0, 0, mWidth, mHeight);
      let threadImageData = threadCTX.getImageData(0, 0, mWidth, mHeight);
      debugContainer.appendChild(threadCanvas);
      nesWorker.postMessage([ threadImageData, th ]);

      nesWorker.onmessage = (e) => {
        switch (e.data[0]) {
          case 'message':
            updateProgress(e.data[1], e.data[2]);
            break;
          case 'imageData':
            drawNesImage(e.data[1], e.data[2]);
            break;
        }
      };

      //nesWorker.postMessage([ imageData, [] ]);
    }
  };
  const updateProgress = (text, thread) => {
    //const log = document.getElementById('log');
    log.innerText = text;
    console.log(text, thread);
  };

  const drawNesImage = (imageData, thread) => {
    console.log(thread);
    let nesCanvas = document.createElement('canvas');
    let nesCTX = nesCanvas.getContext('2d');
    nesCanvas.width = imageData.width;
    nesCanvas.height = imageData.height;
    nesCTX.putImageData(imageData, 0, 0);
    let quadX = imageData.width * thread * multiplier;
    let quadXEnd = quadX + imageData.width * multiplier;
    console.log(quadX, 0, quadXEnd, imageData.height * multiplier);
    nesCanvas.mozImageSmoothingEnabled = false;
    nesCanvas.webkitImageSmoothingEnabled = false;
    nesCanvas.msImageSmoothingEnabled = false;
    nesCanvas.imageSmoothingEnabled = false;
    ctx.drawImage(nesCanvas, quadX, 0, imageData.width * multiplier, imageData.height * multiplier);
  };
});

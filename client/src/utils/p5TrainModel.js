/* global ml5 */
const FileSaver = require('file-saver');

let p5;
let canvasDelegate;
let finishedStatusDelegate;
let canvas;
let neuralNetwork;

export default function trainModel(settings) {
  return function(_p5) {
    p5 = _p5;

    p5.setup = (_) => {
      canvas = p5.createCanvas(settings.videoWidth, settings.videoHeight);
      sendCanvas(canvas);
      let options = {
        inputs: 34,
        outputs: settings.numOfOutputs,
        task: 'classification',
        debug: true,
        learningRate: settings.learningRate,
      };
      neuralNetwork = ml5.neuralNetwork(options);
      neuralNetwork.loadData(settings.sampleData, dataReady);
    };

    function dataReady() {
      neuralNetwork.normalizeData();
      neuralNetwork.train(
        {
          epochs: settings.epochs,
          batchSize: settings.batchSize,
        },
        finished,
      );
    }

    function finished() {
      sendFinishedStatus();
      neuralNetwork.save();
      const sampleDataStringified = JSON.stringify(settings.textToSummarize);
      const blob = new Blob([sampleDataStringified], { type: 'application/json' });
      FileSaver.saveAs(blob, "text_to_summarize.json");
    }
  };
}

export function setCanvasDelegate(_delegate) {
  canvasDelegate = _delegate;
}

function sendCanvas(canvas) {
  if (canvasDelegate !== undefined) {
    canvasDelegate(canvas);
  }
}

export function setFinishedStatusDelegate(_delegate) {
  finishedStatusDelegate = _delegate;
}

function sendFinishedStatus() {
  if (finishedStatusDelegate !== undefined) {
    finishedStatusDelegate(canvas);
  }
}

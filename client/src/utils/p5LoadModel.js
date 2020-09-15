/* global ml5 */
let p5;
let video;
let poseNet;
let pose;
let skeleton;
let canvas;
let neuralNetwork;
let poseLabel = '';
let canvasDelegate;
let resultsDelegate;
export default function loadModel(settings) {
  return function(_p5) {
    p5 = _p5;

    p5.setup = (_) => {
      canvas = p5.createCanvas(settings.videoWidth, settings.videoHeight);
      video = p5.createCapture(p5.VIDEO);
      video.hide();
      poseNet = ml5.poseNet(video, modelLoaded);
      poseNet.on('pose', gotPoses);

      let options = {
        inputs: 34,
        outputs: settings.numOfOutputs,
        task: 'classification',
        debug: true,
      };
      neuralNetwork = ml5.neuralNetwork(options);
      neuralNetwork.load(settings.files, neuralNetworkLoaded);
    };

    p5.draw = (_) => {
      p5.push();
      p5.translate(video.width, 0);
      p5.scale(-1, 1);
      p5.image(video, 0, 0, video.width, video.height);

      if (pose) {
        for (let i = 0; i < skeleton.length; i++) {
          let a = skeleton[i][0];
          let b = skeleton[i][1];
          p5.strokeWeight(2);
          p5.stroke(0);

          p5.line(a.position.x, a.position.y, b.position.x, b.position.y);
        }
        for (let i = 0; i < pose.keypoints.length; i++) {
          let x = pose.keypoints[i].position.x;
          let y = pose.keypoints[i].position.y;
          p5.fill(0);
          p5.stroke(255);
          p5.ellipse(x, y, 16, 16);
        }
      }
      p5.pop();
    };

    function neuralNetworkLoaded() {
      console.log('pose classification ready!');
      classifyPose();
    }

    function classifyPose() {
      if (pose) {
        let inputs = [];
        for (let i = 0; i < pose.keypoints.length; i++) {
          let x = pose.keypoints[i].position.x;
          let y = pose.keypoints[i].position.y;
          inputs.push(x);
          inputs.push(y);
        }
        neuralNetwork.classify(inputs, gotResult);
      } else {
        setTimeout(classifyPose, 100);
      }
    }

    function gotResult(error, results) {
      for (const result of results) {
        result.confidence *= 100;    
      }
      sendResults(results);
      console.log(results);
      classifyPose();
    }

    function gotPoses(poses) {
      if (poses.length > 0) {
        pose = poses[0].pose;
        skeleton = poses[0].skeleton;
      }
    }

    function modelLoaded() {
      console.log('poseNet ready');
    }
  };
}

export function setResultsDelegate(_delegate) {
  resultsDelegate = _delegate;
}

function sendResults(results) {
  if (resultsDelegate !== undefined) {
    resultsDelegate(results);
  }
}

export function setCanvasDelegate(_delegate) {
  canvasDelegate = _delegate;
}

function sendCanvas(canvas) {
  if (canvasDelegate !== undefined) {
    canvasDelegate(canvas);
  }
}

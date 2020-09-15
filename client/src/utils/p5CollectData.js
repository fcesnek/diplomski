/* global ml5 */
let p5;
let video;
let poseNet;
let pose;
let skeleton;
let videoDelegate;
let dataDelegate;
let keyPressedDelegate;
let currentlyRecordingDelegate;
let recordingFinishedDelegate;
let stopRecordingDelegate;
let canvas;

export default function collectData(settings) {
  return function(_p5) {
    p5 = _p5;
    let neuralNetwork;

    let state = 'waiting';

    p5.keyPressed = (_) => {
      if (p5.key == "Escape") {
        sendStopRecording();
      }
      sendKeyPressed(true);
      sendRecordingFinished(false);
      setTimeout(function() {
        state = 'collecting';
        sendKeyPressed(false);
        sendCurrentlyRecordingCheck(true);
        sendRecordingFinished(false);
        setTimeout(function() {
          sendData(neuralNetwork.neuralNetworkData.data.raw);
          sendCurrentlyRecordingCheck(false);
          sendRecordingFinished(true);
          state = 'waiting';
        }, settings.videoDuration);
      }, settings.videoDelay);
    };

    function gotPoses(poses) {
      let inputs = [];
      if (poses.length > 0) {
        pose = poses[0].pose;
        skeleton = poses[0].skeleton;
        if (state == 'collecting') {
          inputs = [];
          for (let i = 0; i < pose.keypoints.length; i++) {
            let x = pose.keypoints[i].position.x;
            let y = pose.keypoints[i].position.y;
            inputs.push(x);
            inputs.push(y);
          }
          let target = [settings.targetLabel];
          neuralNetwork.addData(inputs, target);
        }
      }
    }

    function modelLoaded() {
      console.log('poseNet ready');
    }

    p5.setup = (_) => {
      canvas = p5.createCanvas(settings.videoWidth, settings.videoHeight);

      video = p5.createCapture(p5.VIDEO);
      sendVideo(video, canvas);
      video.hide();
      poseNet = ml5.poseNet(video, modelLoaded);
      poseNet.on('pose', gotPoses);

      let options = {
        inputs: 34,
        outputs: settings.numOfOutputs,
        task: 'classification',
        debug: true
      };
      neuralNetwork = ml5.neuralNetwork(options);
    };

    p5.draw = (_) => {
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
    };
  };
}

export function setVideoDelegate(_delegate) {
  videoDelegate = _delegate;
}

function sendVideo(video, canvas) {
  if (videoDelegate !== undefined) {
    videoDelegate(video, canvas);
  }
}

export function setDataDelegate(_delegate) {
  dataDelegate = _delegate;
}

function sendData(data) {
  if (dataDelegate !== undefined) {
    dataDelegate(data);
  }
}

export function setKeyPressedDelagate(_delegate) {
  keyPressedDelegate = _delegate;
}

function sendKeyPressed(data) {
  if (keyPressedDelegate !== undefined) {
    keyPressedDelegate(data);
  }
}

export function setCurrentlyRecordingCheckDelegate(_delegate) {
  currentlyRecordingDelegate = _delegate;
}

function sendCurrentlyRecordingCheck(data) {
  if (currentlyRecordingDelegate !== undefined) {
    currentlyRecordingDelegate(data);
  }
}

export function setRecordingFinishedDelegate(_delegate) {
  recordingFinishedDelegate = _delegate;
}

function sendRecordingFinished(data) {
  if (recordingFinishedDelegate !== undefined) {
    recordingFinishedDelegate(data);
  }
}

export function setStopRecordingDelegate(_delegate) {
  stopRecordingDelegate = _delegate;
}

function sendStopRecording(data) {
  if (stopRecordingDelegate !== undefined) {
    stopRecordingDelegate(data);
  }
}

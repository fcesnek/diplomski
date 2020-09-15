<template>
  <v-app>
    <v-container>
      <v-flex>
        <v-row>
          <v-col class="ma-2" v-for="(mlClass, index) in classes" :key="index">
            <ClassCard
              @editing="setEditing"
              @recording="setRecording"
              @recordingData="setRecordingData"
              @removeClass="removeClass"
              :mlClass="mlClass"
              :samples.sync="sampleData"
              :mainRecording="recording"
            />
          </v-col>
          <v-col>
            <v-row align="center" justify="center" style="height: 100%;"><v-btn @click="addClass">Add a class</v-btn></v-row>
          </v-col>
        </v-row>
      </v-flex>
    </v-container>

    <v-container>
      <v-alert v-if="finishedRecording" type="success" dismissible>
        Recording finished!
      </v-alert>
    </v-container>

    <v-container align="center" justify="center">
      <v-alert v-if="!validClassNumber" type="info">
        To enable model training, firstly record pose samples using your camera. Also make sure you have at least 2 classes!
      </v-alert>
      <v-alert v-if="modelTrained" type="success">
        Model successfully trained! You can now upload your model or <span to="/trainmodel">evaluate its performance</span>.
      </v-alert>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="6">
          <v-form ref="nameform" v-model="nameValid" lazy-validation>
            <v-text-field label="Sample data name" v-model="samplesName" :rules="nameRules"> </v-text-field>
          </v-form>
        </v-col>
      </v-row>
      <v-row align="center" justify="center">
        <v-btn :disabled="!(validClassNumber && validSummaryData && nameValid)" @click="trainModel">
          Train and export model
        </v-btn>
        <v-icon @click.stop="dialog = true" color="black">mdi-cog</v-icon>
        <v-dialog v-model="dialog" persistent max-width="290">
          <v-card>
            <v-card-title class="headline">Training settings</v-card-title>
            <v-card-actions>
              <v-col>
                <v-form ref="form" v-model="valid" lazy-validation>
                  <v-text-field type="number" ref="batchSize" label="Batch size" v-model="batchSize" :rules="numberRules"></v-text-field>
                  <v-spacer></v-spacer>
                  <v-text-field type="number" label="Epochs" v-model="epochs" :rules="numberRules"> ></v-text-field>
                  <v-spacer></v-spacer>
                  <v-text-field type="number" label="Learning rate" v-model="learningRate" step="0.0001" :rules="numberRules"> ></v-text-field>
                  <v-spacer>
                    <v-btn :disabled="!valid" color="green darken-1" text @click="dialog = false">Agree</v-btn>
                  </v-spacer>
                </v-form>
              </v-col>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
      <v-row class="mt-2" align="center" justify="center">
        <v-btn :disabled="!(validClassNumber && validSummaryData && nameValid)" @click="saveTrainingData">
          Save samples
        </v-btn>
      </v-row>
      <v-alert class="mt-2" v-if="saveSuccess" type="success" dismissible>
        Data saved successfully!
      </v-alert>
      <v-alert class="mt-2" v-if="serverError" type="error" dismissible>
        {{ serverError }}
      </v-alert>
      <v-img :id="modelTrainingCanvasId" :height="videoHeight"></v-img>
    </v-container>

    <v-overlay :value="settingUpOverlay">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
      Setting up PoseNet model and webcam...
    </v-overlay>
    <v-overlay v-show="recording">
      <v-alert v-if="startPromptOverlay" type="info">
        Press any button to start recording poses. The recording will start after {{ videoDelay }} seconds!
      </v-alert>
      <v-alert v-if="currentlyRecording" type="info">
        Currently recording data!
      </v-alert>
      <v-img v-show="recording" :id="videoCanvasId" :height="videoHeight"></v-img>
    </v-overlay>
  </v-app>
</template>

<script>
/* global ml5 */
import collectData from '../utils/p5CollectData';
import trainModel from '../utils/p5TrainModel';
import { setFinishedStatusDelegate } from '../utils/p5TrainModel';
import TrainModelService from '../services/TrainModelService';

import {
  setVideoDelegate,
  setDataDelegate,
  setKeyPressedDelagate,
  setCurrentlyRecordingCheckDelegate,
  setRecordingFinishedDelegate,
  setStopRecordingDelegate,
} from '../utils/p5CollectData';
const P5 = require('p5');
import ClassCard from '../components/ClassCard.vue';
const uniqid = require('uniqid');

export default {
  name: 'Home',
  components: {
    ClassCard,
  },
  async created() {
    const trainingSampleId = this.$route.params.id;
    if (trainingSampleId) {
      this.editingSamples = true;
      const allSampleDataDb = (await TrainModelService.list()).data.trainingData;
      const thisSample = allSampleDataDb.find((s) => s._id === trainingSampleId);
      this.samplesName = thisSample.name;
      this.sampleData = thisSample.data;
      const uniqueOutputs = [...new Set(this.sampleData.map((item) => item.ys['0']))];
      this.classes = [];
      for (const output of uniqueOutputs) {
        let thisClassSamples = this.sampleData.filter((el) => el.ys['0'] === output);
        let text = thisSample.texts.find((t) => t.outputName === output).text;
        const mlClass = {
          name: output,
          uniqueId: uniqid(),
          recordDelay: 3,
          recordDuration: 8,
          numOfSamples: thisClassSamples.length,
          text: text,
        };
        this.classes.push(mlClass);
      }
    }
  },
  data() {
    return {
      numberRules: [(v) => !!v || 'Value is required', (v) => v > 0 || 'Enter a positive number'],
      nameRules: [(v) => !!v || 'Name is required', (v) => (v && v.length <= 30) || 'Name must be less than 30 characters'],
      nameValid: false,
      classes: [
        {
          name: 'Class 1',
          uniqueId: uniqid(),
          numOfSamples: 0,
          recordDelay: 3,
          recordDuration: 8,
          text: '',
        },
        {
          name: 'Class 2',
          uniqueId: uniqid(),
          numOfSamples: 0,
          recordDelay: 3,
          recordDuration: 8,
          text: '',
        },
      ],
      editing: false,
      recording: false,
      videoCanvasId: uniqid(),
      videoHeight: 480,
      videoWidth: 640,
      p5sketch: null,
      video: null,
      canvas: null,
      videoDelay: '',
      videoDuration: '',
      targetLabel: '',
      sampleData: [],
      settingUpOverlay: false,
      startPromptOverlay: false,
      currentTimeout: 0,
      currentlyRecording: false,
      finishedRecording: false,
      modelTrainingCanvasId: 'modelTrainingCanvas',
      training: false,
      jsonFile: null,
      validClassNumber: false,
      valid: false,
      dialog: false,
      batchSize: 16,
      epochs: 50,
      learningRate: 0.0001,
      modelTrained: false,
      samplesName: '',
      validSummaryData: false,
      saveSuccess: false,
      serverError: '',
      editingSamples: false,
    };
  },
  watch: {
    finishedRecording: function(val) {
      if (val === true) {
        this.recording = false;
      }
    },
    classes: {
      deep: true,
      immediate: true,
      handler() {
        this.validClassNumber = this.classes.every((mlClass) => mlClass.numOfSamples !== 0) && this.classes.length > 1;
        this.validSummaryData = this.classes.every((mlClass) => mlClass.text.length !== 0);
      },
    },
    recording: function(val) {
      if (val === true) {
        this.startRecording();
        this.settingUpOverlay = true;
        setTimeout(() => {
          this.settingUpOverlay = false;
          this.startPromptOverlay = true;
        }, this.videoDelay * 1000);
      } else {
        this.p5sketch.remove();
        this.p5sketch = window.setup = window.draw = null;
        this.video.remove();
        this.canvas.remove();
        this.video.elt.srcObject.getTracks().forEach((track) => track.stop());
      }
    },
    sampleData: function(val) {
      this.classes.forEach((mlClass) => {
        mlClass.numOfSamples = this.sampleData.filter((d) => d.ys['0'] === mlClass.name).length;
      });
    },
  },
  methods: {
    videoCallback: function(video, canvas) {
      this.video = video;
      this.canvas = canvas;
    },
    dataCallback: function(data) {
      if (this.sampleData.length) {
        this.sampleData.push(...data);
      } else {
        this.sampleData = data;
      }
    },
    modelTrainedCallback: function() {
      this.modelTrained = true;
      this.p5sketch.remove();
      this.p5sketch = window.setup = window.draw = null;
    },
    keyPressCallback: function(data) {
      this.startPromptOverlay = data;
    },
    recordingFinishedCallback: function(data) {
      this.finishedRecording = data;
    },
    currentlyRecordingCallback: function(data) {
      this.currentlyRecording = data;
    },
    stopRecordingCallback: function() {
      this.recording = false;
    },
    setEditing({ editing }) {
      this.editing = editing;
    },
    setRecording({ recording }) {
      this.recording = recording;
    },
    setRecordingData({ targetLabel, videoDelay, videoDuration }) {
      this.targetLabel = targetLabel;
      this.videoDelay = Number(videoDelay);
      this.videoDuration = Number(videoDuration);
    },
    removeClass({ mlClass }) {
      this.classes.splice(
        this.classes.findIndex((item) => item.name === mlClass.name),
        1,
      );
    },
    addClass() {
      let newClass = {
        name: `Class ${this.classes.length + 1}`,
        uniqueId: uniqid(),
        numOfSamples: 0,
        recordDelay: 3,
        recordDuration: 8,
        text: '',
      };
      this.classes.push(newClass);
    },
    startRecording() {
      const mySketch = collectData({
        targetLabel: this.targetLabel,
        videoDelay: Number(this.videoDelay) * 1000,
        videoDuration: Number(this.videoDuration) * 1000,
        videoWidth: this.videoWidth,
        videoHeight: this.videoHeight,
        numOfSamples: this.classes.length,
      });
      setVideoDelegate(this.videoCallback);
      setDataDelegate(this.dataCallback);
      setKeyPressedDelagate(this.keyPressCallback);
      setRecordingFinishedDelegate(this.recordingFinishedCallback);
      setCurrentlyRecordingCheckDelegate(this.currentlyRecordingCallback);
      setStopRecordingDelegate(this.stopRecordingCallback);
      this.p5sketch = new P5(mySketch, this.videoCanvasId);
    },
    trainModel() {
      const fileSampleData = {
        data: this.sampleData,
      };
      const sampleDataStringified = JSON.stringify(fileSampleData);
      let list = new DataTransfer();
      const blob = new Blob([sampleDataStringified], { type: 'application/json' });
      const file = new File([blob], 'sampleData.json');
      list.items.add(file);
      let myFileList = list.files;
      const classesData = this.classes.map((mlClass) => {
        const subset = {
          outputName: mlClass.name,
          text: mlClass.text,
        };
        return subset;
      });
      const textToSummarize = {
        samplesName: this.samplesName,
        classes: classesData,
      };
      setFinishedStatusDelegate(this.modelTrainedCallback);
      const trainingSketch = trainModel({
        videoWidth: this.videoWidth,
        videoHeight: this.videoHeight,
        numOfOutputs: this.classes.length,
        sampleData: myFileList,
        batchSize: this.batchSize,
        epochs: this.epochs,
        learningRate: this.learningRate,
        textToSummarize,
      });

      this.p5sketch = new P5(trainingSketch, this.modelTrainingCanvasId);
    },
    async saveTrainingData() {
      const classesData = this.classes.map((mlClass) => {
        const subset = {
          outputName: mlClass.name,
          text: mlClass.text,
        };
        return subset;
      });
      const trainingData = {
        name: this.samplesName,
        data: this.sampleData,
        texts: classesData,
      };
      if (this.editingSamples) {
        try {
          const result = await TrainModelService.edit({ trainingData });
          if (result) this.saveSuccess = true;
        } catch (error) {
          this.serverError = error.response.data.error;
        }
      } else {
        try {
          const result = await TrainModelService.new({ trainingData });
          if (result) this.saveSuccess = true;
        } catch (error) {
          this.serverError = error.response.data.error;
        }
      }
    },
  },
};
</script>

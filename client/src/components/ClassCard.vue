<template>
  <v-card max-width="640" class="mx-auto">
    <v-toolbar>
      <v-toolbar-title v-if="!editMode">
        {{ localName }}
        <v-icon
          @click="
            toggleEdit();
            emitEditingEvent();
          "
          >mdi-pencil-plus</v-icon
        >
      </v-toolbar-title>
      <v-form v-model="nameValid" lazy-validation>
        <v-text-field v-if="editMode" v-model="localName" :rules="nameRules">
          <template v-slot:prepend>
            <v-icon
              @click="
                toggleEdit();
                emitEditingEvent();
                saveName();
              "
              :disabled="!nameValid"
              >mdi-check</v-icon
            >
          </template>
        </v-text-field>
      </v-form>
      <v-spacer></v-spacer>
      <v-menu bottom left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn dark icon v-bind="attrs" v-on="on">
            <v-icon color="black">mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="removeClass">
            <v-list-item-title>Remove class</v-list-item-title>
          </v-list-item>
          <v-list-item @click="removeSamples">
            <v-list-item-title>Remove samples</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar>
    <v-list-item>
      <v-form style="width: 100%;" v-model="textValid" lazy-validation>
        <v-textarea :rules="textRules" name="textToSummarize" label="Instructions to summarize" v-model="mlClass.text"></v-textarea>
      </v-form>
    </v-list-item>
    <v-list-item-title class="ml-4">Current number of samples: {{ mlClass.numOfSamples }}</v-list-item-title>
    <v-list-item-title class="ml-4">Add training samples:</v-list-item-title>
    <v-card-actions>
      <v-btn
        @click="
          toggleRecording();
          emitRecordingEvent();
          emitTargetLabel();
        "
        text
        color="deep-purple accent-4"
        >Webcam</v-btn
      >
      <v-btn color="primary" text @click.stop="dialog = true">Settings</v-btn>
    </v-card-actions>
    <v-dialog v-model="dialog" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">Webcam settings</v-card-title>
        <v-card-actions>
          <v-col>
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-text-field
                type="number"
                @input="emitTargetLabel"
                ref="recordDelay"
                label="Record delay"
                v-model="mlClass.recordDelay"
                suffix="seconds"
                :rules="videoDelayRules"
              ></v-text-field>
              <v-spacer></v-spacer>
              <v-text-field
                type="number"
                @input="emitTargetLabel"
                label="Record duration"
                v-model="mlClass.recordDuration"
                suffix="seconds"
                :rules="videoDurationRules"
              >
                ></v-text-field
              >
              <v-spacer>
                <v-btn :disabled="!valid" color="green darken-1" text @click="dialog = false">Agree</v-btn>
              </v-spacer>
            </v-form>
          </v-col>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import collectData from '../utils/p5CollectData';
import { setDelegate } from '../utils/p5CollectData';
const P5 = require('p5');

export default {
  data() {
    return {
      localName: this.mlClass.name,
      valid: true,
      editMode: false,
      videoHeight: 480,
      recording: false,
      p5sketch: null,
      video: null,
      canvas: null,
      dialog: false,
      videoDelayRules: [(v) => !!v || 'Value is required', (v) => v > 0 || 'Enter a positive number'],
      videoDurationRules: [(v) => !!v || 'Value is required', (v) => v > 0 || 'Enter a positive number'],
      nameRules: [(v) => !!v || 'Name is required', (v) => (v && v.length <= 10) || 'Name must be less than 10 characters'],
      textRules: [(v) => !!v || 'Text is required'],
      textValid: false,
      nameValid: false,
    };
  },
  props: ['mlClass', 'mainRecording', 'samples'],
  methods: {
    callbackOnP5: function(video, canvas) {
      this.video = video;
      this.canvas = canvas;
    },
    emitEditingEvent() {
      this.$emit('editing', {
        editing: this.editMode,
      });
    },
    emitRecordingEvent() {
      this.$emit('recording', {
        recording: this.recording,
      });
    },
    emitTargetLabel() {
      this.$emit('recordingData', {
        targetLabel: this.mlClass.name,
        videoDelay: this.mlClass.recordDelay,
        videoDuration: this.mlClass.recordDuration,
      });
    },
    removeClass() {
      this.removeSamples();
      this.$emit('removeClass', {
        mlClass: this.mlClass,
      });
    },
    removeSamples() {
      let modifiedSamples = this.samples;
      modifiedSamples = modifiedSamples.filter((el) => el.ys['0'] !== this.mlClass.name);
      this.$emit('update:samples', modifiedSamples);
    },
    toggleEdit() {
      this.editMode = !this.editMode;
    },
    toggleRecording() {
      this.recording = !this.recording;
    },
    saveName() {
      let allSamples = this.samples;
      let thisClassSamples = allSamples.filter((el) => el.ys['0'] === this.mlClass.name);
      let otherSamples = allSamples.filter((el) => el.ys['0'] !== this.mlClass.name);
      for (const sample of thisClassSamples) {
        sample.ys[0] = this.localName;
      }
      this.mlClass.name = this.localName;
      this.$emit('update:samples', [...thisClassSamples, ...otherSamples]);
    },
  },
};
</script>

<style scoped>
.title {
  word-break: break-all;
}
</style>

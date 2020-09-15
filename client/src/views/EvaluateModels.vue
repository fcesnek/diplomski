<template>
  <v-app>
    <v-container>
      <v-flex>
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-header>Load model from local files...</v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-row>
                <v-file-input v-model="modelFile" accept=".json" label="Model (default: model.json)"></v-file-input>
                <v-file-input v-model="metaFile" accept=".json" label="Metadata (default: model_meta.json)"></v-file-input>
              </v-row>
              <v-row>
                <v-file-input v-model="weightsFile" accept=".bin" label="Weights (default: model.weights.bin)"></v-file-input>
                <v-file-input v-model="textsFile" accept=".json" label="Texts (default: text_to_summarize.json)"></v-file-input>
              </v-row>
              <v-alert v-if="fileError" type="error" dismissible>
                Upload all neccessary files!
              </v-alert>
              <v-row class="mt-3">
                <v-col>
                  <v-btn @click="loadFromFiles">Load model</v-btn>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6">
                  <v-text-field v-model="modelName" clear-icon="mdi-close-circle" clearable label="Model name" type="text"> </v-text-field>
                  <v-btn @click="saveToAWS" :disabled="!modelName || !modelName.length">
                    Save model
                  </v-btn>
                </v-col>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header>My models...</v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-list>
                <v-subheader>Saved models</v-subheader>
                <v-list-item-group v-model="numOfModels" color="primary">
                  <v-list-item v-for="(model, i) in models" :key="i" @click="selectModel(model)">
                    <v-list-item-content>
                      <v-list-item-title v-html="model.name"></v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-btn icon @click="toggleDeleteDialog(model)">
                        <v-icon color="red lighten-1">mdi-delete</v-icon>
                      </v-btn>
                    </v-list-item-action>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
              <v-row class="mt-3">
                <v-btn color="success" @click="loadFromDb">Load model</v-btn>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-dialog v-model="deleteDialog" max-width="500px">
          <v-card>
            <v-card-title>
              <span class="text-wrap">Are you sure you want to delete this model?</span>
            </v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="deleteModel">Yes</v-btn>
              <v-btn color="blue darken-1" text @click="closeDialog">No</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-flex>
    </v-container>
    <v-container>
      <v-row>
        <v-col cols="12" sm="6">
          <v-img :id="modelCanvasId" :height="videoHeight"></v-img>
        </v-col>
        <v-col cols="12" sm="3">
          <v-flex v-if="results.length">
            <v-row v-for="(result, index) in results" :key="result.label">
              <v-progress-linear mb-6 v-model="result.confidence" :color="index === 0 ? 'green' : 'amber'" height="25">
                <strong>{{ result.label }}</strong>
              </v-progress-linear>
            </v-row>
          </v-flex>
        </v-col>
        <v-col cols="12" sm="3">
          <v-card max-width="344" class="mx-auto">
            <v-list-item>
              <v-list-item-avatar color="grey"></v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="headline">Our Changing Planet</v-list-item-title>
                <v-list-item-subtitle>by Kurt Wagner</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-img src="https://cdn.vuetifyjs.com/images/cards/mountain.jpg" height="194"></v-img>

            <v-card-text>
              Visit ten places on our planet that are undergoing the biggest changes today.
            </v-card-text>

            <v-card-actions>
              <v-btn text color="deep-purple accent-4">
                Read
              </v-btn>
              <v-btn text color="deep-purple accent-4">
                Bookmark
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn icon>
                <v-icon>mdi-heart</v-icon>
              </v-btn>
              <v-btn icon>
                <v-icon>mdi-share-variant</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
/* global ml5 */
import ModelService from '../services/ModelService';
import loadModel from '../utils/p5LoadModel';
import { setResultsDelegate } from '../utils/p5LoadModel';
import constants from '../utils/constants';
const P5 = require('p5');
const uniqid = require('uniqid');
import axios from 'axios';

export default {
  name: 'Home',
  data() {
    return {
      modelFile: null,
      metaFile: null,
      weightsFile: null,
      textsFile: null,
      modelCanvasId: 'trainedModelCanvas',
      p5sketch: null,
      videoWidth: 640,
      videoHeight: 480,
      numOfOutputs: 4,
      fileError: false,
      results: [],
      modelName: '',
      numOfModels: 0,
      models: [],
      selectedModel: {},
      modelToDelete: {},
      deleteDialog: false,
      successDeleteAlert: '',
      errorDeleteAlert: '',
    };
  },
  async mounted() {
    this.models = (await ModelService.list()).data.models;
    this.numOfModels = this.models.length;
  },
  watch: {
    deleteDialog(val) {
      // eslint-disable-next-line
      val || this.closeDialog();
    },
  },
  methods: {
    closeDialog() {
      this.deleteDialog = false;
      this.modelToDelete = {};
    },
    toggleDeleteDialog(model) {
      this.deleteDialog = true;
      this.modelToDelete = model;
    },
    async deleteModel() {
      try {
        await ModelService.remove(this.modelToDelete._id);
        this.models = this.models.filter((obj) => obj._id !== this.modelToDelete._id);
        this.billToDelete = {};
        this.closeDialog();
        this.successDeleteAlert = '';
        this.successDeleteAlert = 'Model successfully deleted.';
      } catch (error) {
        this.errorDeleteAlert = '';
        this.errorDeleteAlert = error.response.data.error;
      }
    },
    async loadFromDb() {
      console.log(this.selectedModel);
      const metadata = await axios.get(this.selectedModel.metaLocation);
      this.numOfOutputs = metadata.data.meta.outputUnits;
      const mySketch = loadModel({
        videoWidth: this.videoWidth,
        videoHeight: this.videoHeight,
        numOfOutputs: this.numOfOutputs,
        awsModel: this.selectedModel.modelLocation,
        awsMetadata: this.selectedModel.metaLocation,
        awsWeights: this.selectedModel.weightsLocation,
        awsFilesModel: true,
      });
      setResultsDelegate(this.setResults);
      this.p5sketch = new P5(mySketch, this.modelCanvasId);
    },
    selectModel(model) {
      this.selectedModel = model;
    },
    setResults: function(results) {
      this.results = results;
    },
    async saveToAWS() {
      if (!(this.modelFile && this.metaFile && this.weightsFile && this.textsFile)) {
        this.fileError = true;
        return;
      }
      const data = new FormData();
      data.append('files', this.modelFile, `_${this.modelName}_${constants.uniqueKey}model_${this.modelFile.name}`);
      data.append('files', this.metaFile, `_${this.modelName}_${constants.uniqueKey}metadata_${this.metaFile.name}`);
      data.append('files', this.weightsFile, `_${this.modelName}_${constants.uniqueKey}weights_${this.weightsFile.name}`);
      data.append('files', this.textsFile, `_${this.modelName}_${constants.uniqueKey}textstosummarize_${this.textsFile.name}`);
      const results = await ModelService.new(data, {
        accept: 'application/json',
        'Accept-Language': 'en-US,en;q=0.8',
        'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
      });
    },
    loadFromFiles() {
      if (!(this.modelFile && this.metaFile && this.weightsFile && this.textsFile)) {
        this.fileError = true;
        return;
      }
      let modelFileList = new DataTransfer();
      const reader = new FileReader();
      reader.onload = (e) => (this.numOfOutputs = JSON.parse(e.target.result).outputUnits);
      reader.readAsText(this.metaFile);

      modelFileList.items.add(this.modelFile);
      modelFileList.items.add(this.metaFile);
      modelFileList.items.add(this.weightsFile);
      const mySketch = loadModel({
        videoWidth: this.videoWidth,
        videoHeight: this.videoHeight,
        numOfOutputs: this.numOfOutputs,
        files: modelFileList.files,
        localFilesModel: true,
      });
      setResultsDelegate(this.setResults);
      this.p5sketch = new P5(mySketch, this.modelCanvasId);
    },
  },
};
</script>

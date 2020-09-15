<template>
  <v-app>
    <v-container fill-height fluid class="mt-8">
      <v-layout justify-center>
        <v-flex xs12 sm8 md4>
          <v-list>
            <v-subheader>Saved samples</v-subheader>
            <v-list-item-group v-model="numOfTrainingSamples" color="primary">
              <v-list-item v-for="(sample, i) in dataSamples" :key="i" @click="selectSample(sample)">
                <v-list-item-content>
                  <v-list-item-title v-html="sample.name"></v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon @click="toggleDeleteDialog(sample)">
                    <v-icon color="red lighten-1">mdi-delete</v-icon>
                  </v-btn>
                </v-list-item-action>
                <v-list-item-action>
                  <v-btn
                    icon
                    :to="{
                      name: 'train-model-id',
                      params: {
                        id: sample._id,
                      },
                    }"
                  >
                    <v-icon color="blue lighten-1">mdi-pencil</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-flex>
        <v-dialog v-model="deleteDialog" max-width="500px">
          <v-card>
            <v-card-title>
              <span class="text-wrap">Are you sure you want to delete this data sample?</span>
            </v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="deleteSample">Yes</v-btn>
              <v-btn color="blue darken-1" text @click="closeDialog">No</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-layout>
    </v-container>
  </v-app>
</template>

<script>
import TrainModelService from '@/services/TrainModelService';

export default {
  data() {
    return {
      error: '',
      dataSamples: [],
      numOfTrainingSamples: 0,
      selectedSample: null,
      deleteDialog: false,
      sampleToDelete: null,
      successDeleteAlert: '',
      errorDeleteAlert: '',
    };
  },
  async mounted() {
    this.dataSamples = (await TrainModelService.list()).data.trainingData;
    this.numOfTrainingSamples = this.dataSamples.length;
  },
  watch: {
    deleteDialog(val) {
      // eslint-disable-next-line
      val || this.closeDialog();
    },
  },
  methods: {
    selectSample(sample) {
      this.selectedSample = sample;
    },
    closeDialog() {
      this.deleteDialog = false;
      this.sampleToDelete = {};
    },
    toggleDeleteDialog(model) {
      this.deleteDialog = true;
      this.sampleToDelete = model;
    },
    async deleteSample() {
      try {
        await TrainModelService.remove(this.sampleToDelete._id);
        this.dataSamples = this.dataSamples.filter((obj) => obj._id !== this.sampleToDelete._id);
        this.sampleToDelete = {};
        this.closeDialog();
        this.successDeleteAlert = '';
        this.successDeleteAlert = 'Model successfully deleted.';
      } catch (error) {
        this.errorDeleteAlert = '';
        this.errorDeleteAlert = error.response.data.error;
      }
    },
  },
  computed: {},
};
</script>

<style></style>

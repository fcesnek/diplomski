import Api from '@/services/Api';

export default {
  list() {
    return Api().get('trainData/list');
  },
  new(trainingData) {
    return Api().post('trainData/new', trainingData);
  },
  remove(trainingDataId) {
    return Api().delete('trainData/remove', { params: { trainingDataId } });
  },
  edit(trainingData) {
    return Api().put('trainData/edit', trainingData);
  },
};

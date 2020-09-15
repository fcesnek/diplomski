import Api from '@/services/Api';

export default {
  list() {
    return Api().get('model/list');
  },
  new(data, headers) {
    return Api(headers).post('model/new', data);
  },
  remove(modelId) {
    return Api().delete('model/remove', { params: { modelId } });
  },
};

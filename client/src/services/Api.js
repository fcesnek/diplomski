import axios from 'axios';
import store from '../store';

export default (extraHeaders = {}) => axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/' : `http://localhost:${process.env.PORT || 8081}/`,
  headers: {
    Authorization: `Bearer ${store.getters.token}`,
    ...extraHeaders
  },
});

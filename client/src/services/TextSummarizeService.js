import axios from 'axios';

const API_KEY = '86d9e2f53f4e21a9de865bd3676299e2';
export default {
  async summarize(text, numOfSentences) {
    let bodyFormData = new FormData();
    bodyFormData.append('key', API_KEY);
    bodyFormData.append('txt', text);
    bodyFormData.append('sentences', numOfSentences);

    const result = await axios({
      method: 'post',
      url: 'https://api.meaningcloud.com/summarization-1.0',
      data: bodyFormData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return result;
  },
};

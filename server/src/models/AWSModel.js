const mongoose = require('mongoose');

const awsModelSchema = new mongoose.Schema({
  name: String,
  modelKey: String,
  metaKey: String,
  weightsKey: String,
  modelLocation: String,
  metaLocation: String,
  weightsLocation: String,
  textKey: String,
  textLocation: String,
});
module.exports = mongoose.model('AWSModel', awsModelSchema);

const mongoose = require('mongoose');

const trainDataSchema = new mongoose.Schema({
  name: String,
  texts: [
    {
      outputName: String,
      text: String,
    },
  ],
  data: [
    {
      xs: {
        0: Number,
        1: Number,
        2: Number,
        3: Number,
        4: Number,
        5: Number,
        6: Number,
        7: Number,
        8: Number,
        9: Number,
        10: Number,
        11: Number,
        12: Number,
        13: Number,
        14: Number,
        15: Number,
        16: Number,
        17: Number,
        18: Number,
        19: Number,
        20: Number,
        21: Number,
        22: Number,
        23: Number,
        24: Number,
        25: Number,
        26: Number,
        27: Number,
        28: Number,
        29: Number,
        30: Number,
        31: Number,
        32: Number,
        33: Number,
      },
      ys: {
        0: String,
      },
    },
  ],
});
module.exports = mongoose.model('TrainData', trainDataSchema);

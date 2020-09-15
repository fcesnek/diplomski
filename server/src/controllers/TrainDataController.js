const { User } = require('../models/User');
const TrainData = require('../models/TrainData');
const ObjectID = require('mongodb').ObjectID;

module.exports = {
  async list(req, res) {
    try {
      const { user } = req;
      const dbUser = await User.findOne({
        username: user.username,
      });

      if (dbUser) {
        res.status(200).send({ trainingData: dbUser.trainingData });
      } else res.status(400).send({ error: 'Error fetching data. Try again later.' });
    } catch (err) {
      res.status(500).send({ error: 'Error fetching data. Try again later.' });
    }
  },
  async new(req, res) {
    try {
      const { trainingData } = req.body;
      const { username } = req.user;

      const dbUser = await User.findOne({
        username,
      });

      try {
        const existingTrainingData = await User.findOne({ username, 'trainingData.name': trainingData.name });
        if (!existingTrainingData) {
          const trainData = new TrainData(trainingData);
          dbUser.trainingData.push(trainData);
        } else {
          res.status(400).send({ error: `Training data with the name ${trainingData.name} already exists!` });
          return;
        }
      } catch (error) {
        res.status(400).send({ error: `Training data with the name ${trainingData.name} already exists!` });
      }
      dbUser.save(function (error) {
        if (error) res.status(500).send({ error });
      });

      res.status(200).send({ trainingData: dbUser.trainingData, username: dbUser.username });
    } catch (error) {
      res.status(500).send({ error });
    }
  },
  async remove(req, res) {
    try {
      const { user } = req;
      const { trainingDataId } = req.query;

      const { trainingData } = await User.findById(new ObjectID(user._id));
      const sample = trainingData.find((s) => s._id.toString() === trainingDataId);
      const dbUser = await User.findOneAndUpdate(
        {
          username: user.username,
        },
        {
          $pull: {
            trainingData: { _id: trainingDataId },
          },
        },
      );

      res.status(200).send({ trainingData: sample, user: dbUser });
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: 'Error deleting data. Try again later.' });
    }
  },
  async edit(req, res) {
    try {
      const { trainingData } = req.body;
      const { username } = req.user;

      const dbUser = await User.findOne({
        username,
      });

      console.log(dbUser);
      let updated;
      try {
        dbUser.trainingData = trainingData;
        updated = await dbUser.save();

      } catch (error) {
        res.status(400).send({ error: 'Error saving data. Try again later.' });
      }
      res.status(200).send({ trainingData: updated, username: dbUser.username });
    } catch (error) {
      res.status(500).send({ error });
    }
  },
};

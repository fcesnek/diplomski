const { User } = require('../models/User');
const AWSModel = require('../models/AWSModel');
const constants = require('../utils/constants');
const ObjectID = require('mongodb').ObjectID;
const aws = require('aws-sdk');

aws.config = new aws.Config({
  accessKeyId: 'ASIAUM34W6RIMSDZ3GBB',
  secretAccessKey: 'LVVkY7kaKnh8heoagcC3C42pMo4nmitc30c2mVOq',
  region: 'us-east-1',
  sessionToken: 'FwoGZXIvYXdzEKL//////////wEaDDbJrlutP8oFdiTfoCK/AbXEx7T6pQNX9f4DOSOL2Hjh4BzwtvuO4MAU6d4OPq5ley5yZi/Oem1CypFirIiI22LZ666aw3vue+NrP7DgKcPKXG/vgnu0JTCqXL2oZbFxoTzy3E9djcAhUAeRT1LBbWJI2Hj3VcyLI723ZfH4oeCob122lt6HYcvocVjh1BzwYYGL6cM5UacSqrQpuqAjU5zZQbEaICWFeyJ9D9a97eGuJ5LK0gLZzs0A5dU23jztDmUxZHBf79Gzl/oB1Rd9KIvP9foFMi1YZpJ/DrXUjPm9oxC86I4XxFzY9et1ZuMh2zqvmFX+K48JfAdkdYgk8el4+Nc='
});
const s3 = new aws.S3();

module.exports = {
  async new(req, res) {
    try {
      const files = req.files;
      const modelFile = files.find((file) => file.originalname.includes(`_${constants.uniqueKey}model_`));
      const metaFile = files.find((file) => file.originalname.includes(`_${constants.uniqueKey}metadata_`));
      const weightsFile = files.find((file) => file.originalname.includes(`_${constants.uniqueKey}weights_`));
      const textsFile = files.find((file) => file.originalname.includes(`_${constants.uniqueKey}textstosummarize_`));
      const modelName = modelFile.originalname.split('_')[1];
      const { username } = req.user;

      const dbUser = await User.findOne({
        username,
      });

      try {
        const existingModel = await User.findOne({ username, 'models.name': modelName });
        if (!existingModel) {
          const modelDb = new AWSModel({
            name: modelName,
            modelKey: modelFile.key,
            modelLocation: modelFile.location,
            metaKey: metaFile.key,
            metaLocation: metaFile.location,
            weightsKey: weightsFile.key,
            weightsLocation: weightsFile.location,
            textKey: textsFile.key,
            textLocation: textsFile.location,
          });
          dbUser.models.push(modelDb);
        } else {
          res.status(400).send({ error: `Model with the name ${modelName} already exists!` });
          return;
        }
      } catch (error) {
        res.status(400).send({ error: `Model with the name ${modelName} already exists!` });
      }
      dbUser.save(function (error) {
        if (error) res.status(500).send({ error });
      });

      res.send({
        status: 200,
        data: {
          sucess: true,
          dbUser,
        },
      });
    } catch (error) {
      res.status(500).send({ error });
    }
  },
  async list(req, res) {
    try {
      const { user } = req;
      const dbUser = await User.findOne({
        username: user.username,
      });

      if (dbUser) {
        res.status(200).send({ models: dbUser.models });
      } else res.status(400).send({ error: 'Error fetching data. Try again later.' });
    } catch (err) {
      res.status(500).send({ error: 'Error fetching data. Try again later.' });
    }
  },
  async remove(req, res) {
    try {
      const { user } = req;
      const { modelId } = req.query;

      const { models } = await User.findById(new ObjectID(user._id));
      const model = models.find((m) => m._id.toString() === modelId);
      const deleteParam = {
        Bucket: 'diplomski',
        Delete: {
          Objects: [{ Key: model.modelKey }, { Key: model.metaKey }, { Key: model.weightsKey }, { Key: model.textKey }],
        },
      };
      await s3.deleteObjects(deleteParam).promise();
      const dbUser = await User.findOneAndUpdate(
        {
          username: user.username,
        },
        {
          $pull: {
            models: { _id: modelId },
          },
        },
      );

      res.status(200).send({ models: model, user: dbUser });
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: 'Error deleting data. Try again later.' });
    }
  },
};

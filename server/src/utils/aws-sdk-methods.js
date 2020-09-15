const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

aws.config = new aws.Config({
  accessKeyId: 'ASIAUM34W6RIMSDZ3GBB',
  secretAccessKey: 'LVVkY7kaKnh8heoagcC3C42pMo4nmitc30c2mVOq',
  region: 'us-east-1',
  sessionToken: 'FwoGZXIvYXdzEKL//////////wEaDDbJrlutP8oFdiTfoCK/AbXEx7T6pQNX9f4DOSOL2Hjh4BzwtvuO4MAU6d4OPq5ley5yZi/Oem1CypFirIiI22LZ666aw3vue+NrP7DgKcPKXG/vgnu0JTCqXL2oZbFxoTzy3E9djcAhUAeRT1LBbWJI2Hj3VcyLI723ZfH4oeCob122lt6HYcvocVjh1BzwYYGL6cM5UacSqrQpuqAjU5zZQbEaICWFeyJ9D9a97eGuJ5LK0gLZzs0A5dU23jztDmUxZHBf79Gzl/oB1Rd9KIvP9foFMi1YZpJ/DrXUjPm9oxC86I4XxFzY9et1ZuMh2zqvmFX+K48JfAdkdYgk8el4+Nc='
});
const s3 = new aws.S3();
const upload = multer({
  storage: multerS3({
    s3: s3,
    acl: 'public-read',
    bucket: 'diplomski',
    contentType: function (req, file, cb) {
      cb(null, file.mimetype);
    },
    key: function (req, file, cb) {
      const { user } = req;
      const key = `users/${user._id}/models/${Date.now()}_${file.originalname}`;
      cb(null, key);
    },
  }),
});

module.exports = upload;

const Joi = require('joi');

module.exports = {
  signup (req, res, next) {
    const schema = Joi.object({
      username: Joi.string().alphanum().min(3).max(30).required(),
      password: Joi.string().regex(
        new RegExp('^[a-zA-z0-9]{6,32}$')
      ).min(6).max(32).required(),
    });
    const { error } = Joi.validate(req.body, schema);
    if (error) {
      switch (error.details[0].context.key) {
      case 'username':
        res.status(400).send({
          error: `Username must follow these rules:
            <br>
            1. Only alphanumerical characters
            <br>
            2. Length must be between 3 and 30 characters
            `
        });
        break;
      case 'password':
        res.status(400).send({
          error: `Password must follow these rules:
            <br>
            1. Only alphanumerical characters
            <br>
            2. Length must be between 6 and 32 characters.
            `
        });
        break;
      default:
        res.status(400).send({
          error: 'Check the required fields and try again.'
        });
      }
    } else {
      next();
    }
  }
};

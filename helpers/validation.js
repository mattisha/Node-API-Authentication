const Joi = require("@hapi/joi");

const schema = Joi.object({
  email: Joi.string().required().lowercase().email(),
  password: Joi.string().required().min(4),
});

module.exports = { schema };

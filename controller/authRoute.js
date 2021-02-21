const User = require("../model/Model");
const { schema } = require("../helpers/validation");
const createError = require("http-errors");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefereshToken,
} = require("../helpers/jwt");
const client = require("../helpers/redis");

module.exports = {
  register: async (req, res, next) => {
    try {
      const result = await schema.validateAsync(req.body);

      const doesExist = await User.findOne({ email: result.email });
      if (doesExist)
        throw createError.Conflict(`${result.email} is already registered`);

      const user = new User(result);
      const savedUser = await user.save();

      const accessToken = await signAccessToken(savedUser.id);
      const refereshToken = await signRefreshToken(savedUser.id);

      res.send({ accessToken, refereshToken });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      // checking if oncoming request is correct
      const result = await schema.validateAsync(req.body);
      // checking if the user is registered
      const user = await User.findOne({ email: result.email });
      if (!user) throw createError.NotFound("user is not found");

      //validating password
      const isMatch = await user.isValidPassword(result.password);
      if (!isMatch) throw createError.Unauthorized("invalid email/password");
      // generating access token
      const accessToken = await signAccessToken(user.id);
      const refershToken = await signRefreshToken(user.id);

      res.send({ accessToken, refershToken });
    } catch (error) {
      // creating error message if that comes from validation schema
      if (error.isJoi === true)
        return next(createError.BadRequest("email/password are invalid"));
      next(error);
    }
  },

  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw createError.BadRequest("no refresh token found");

      const userId = await verifyRefereshToken(refreshToken);

      const accessToken = await signAccessToken(userId);
      const refToken = await signRefreshToken(userId);

      res.send({ refToken, accessToken });
    } catch (error) {
      next(error);
    }
  },
  logout: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw createError.BadRequest();

      const userId = await verifyRefereshToken(refreshToken);
      client.DEL(userId, (err, val) => {
        if (err) throw createError.Unauthorized();
        res.sendStatus(204);
      });
    } catch (error) {
      next(error);
    }
  },
};

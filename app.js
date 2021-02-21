const express = require("express");
const app = express();
const mongoose = require("mongoose");
const createError = require("http-errors");
const { verifyAccessToken } = require("./helpers/jwt");
require("dotenv").config();
app.use(express.json());
const routes = require("./routes/routes");
app.use("/auth/", routes);
require("./helpers/redis");

// db connection
mongoose.connect(
  process.env.DB_CONNECT,
  { useUnifiedTopology: true, useNewUrlParser: true },

  () => {
    console.log("Mongoose Connected");
  }
);

app.get("/", verifyAccessToken, (req, res) => {
  res.send("home page");
});

// error handling
app.use(async (res, req, next) => {
  next(createError.NotFound());
});
// error handling based on the request
app.use(async (error, req, res, next) => {
  res.status(error.status || 500);
  res.send({
    error: {
      status: error.status || 500,
      message: error.message,
    },
  });
});

app.listen(5000, () => {
  console.log("server is running on port 5000");
});

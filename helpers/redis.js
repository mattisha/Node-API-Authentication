const redis = require("redis");
const client = redis.createClient();

client.on("connect", () => {
  console.log("client is connected to redis");
});
client.on("ready", () => {
  console.log("client app is connected and ready to use");
});

client.on("error", (err) => {
  console.log(err.message);
});

client.on("end", () => {
  console.log("disconnected");
});

process.on("SIGINT", () => {
  client.quit();
});

module.exports = client;

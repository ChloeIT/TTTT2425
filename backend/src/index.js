const express = require("express");
const { json } = require("express");

const cors = require("cors");
const { PrismaClient } = require("./generated/prisma");
const authRoute = require("./routes/auth.router");
const app = express();
const PORT = 5000;

app.use(json());
app.use(cors());
const prisma = new PrismaClient();

app.get("/hello", (req, res) => {
  res.send("Hello world");
});

app.use(authRoute);

app.listen(PORT, (error) => {
  if (!error)
    console.log(
      "Server is Successfully Running,and App is listening on port " + PORT
    );
  else console.log("Error occurred, server can't start", error);
});
module.exports = {
  prisma,
};

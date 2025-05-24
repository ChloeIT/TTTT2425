const express = require("express");
const { json, urlencoded } = require("express");
const cors = require("cors");
const authRoute = require("./routes/auth.router");
const examRouter = require("./routes/exam.router");
require("./libs/prisma");

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(json());
app.use(
  urlencoded({
    extended: true,
  })
);

app.get("/hello", (req, res) => {
  res.send("Hello world");
});

app.use(authRoute);
app.use("/exams", examRouter);

app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({
      error: err.message,
    });
  }
});

app.listen(PORT, (error) => {
  if (!error)
    console.log(
      "Server is Successfully Running,and App is listening on port " + PORT
    );
  else console.log("Error occurred, server can't start", error);
});

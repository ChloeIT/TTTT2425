const express = require("express");
const { json, urlencoded } = require("express");
const cors = require("cors");
const authRoute = require("./routes/auth.router");
const examRouter = require("./routes/exam.router");
const userRoute = require("./routes/user.router");
const cookieParser = require("cookie-parser");
const checkPrismaHealth = require("./middlewares/prismaHealthMiddleware");

require("./libs/prisma");

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cookieParser());
app.use(cors());
app.use(json());
app.use(
  urlencoded({
    extended: true,
  })
);

app.use(checkPrismaHealth);
app.get("/hello", (req, res) => {
  res.send("Hello world");
});

app.use(authRoute);
app.use("/users", userRoute);
app.use("/exams", examRouter);

app.use((err, req, res, next) => {
  if (err?.message) {
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

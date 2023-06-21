const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const port = 3010;

const userRouter = require("./routes/users");
const postRouter = require("./routes/posts");
const authRouter = require("./routes/auth");
const commentRouter = require("./routes/comments");
const connect = require("./schemas");
connect();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("assets"));
app.use("/", [userRouter, postRouter, authRouter, commentRouter]);

app.get("/", (req, res) => {
  res.send("can not GET / ");
});

app.listen(port, () => {
  console.log(port, "포트로 서버가 열렸습니다.");
});

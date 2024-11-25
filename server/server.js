const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoute = require("./routes/userRoute");
const messageRoute = require("./routes/messageRoute");
const socket = require("socket.io");
// const multer = require("multer");
const fileUpload = require("express-fileupload");
const path = require("path");
const app = express();
// var storage = multer.diskStorage({
//   destination: function (request, file, callback) {
//     callback(null, "./images");
//   },
//   filename: function (request, file, callback) {
//     console.log(file);
//     callback(null, file.originalname);
//   },
// });
// var upload = multer({
//   storage,
//   limits: { fileSize: 1 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     if (
//       file.mimetype == "image/png" ||
//       file.mimetype == "image/jpg" ||
//       file.mimetype == "image/jpeg"
//     ) {
//       cb(null, true);
//     } else {
//       cb(null, true);
//       const err = new Error("Only .png, .jpg and .jpeg format allowed!");
//       err.name = "ExtensionError";
//       return cb(err);
//     }
//   },
// }).array("uploadedImages", 10);
require("dotenv").config();
app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(fileUpload());
app.use(cors());
app.use("/api/auth", userRoute);
app.use("/api/message", messageRoute);
app.post("/api/profile", (req, res) => {
  console.log(req.body);
  console.log(req.files);

  // upload(req, res, function (err) {
  //   // console.log("req.body", req.body);
  //   // console.log("req.files", req.files);
  //   if (err instanceof multer.MulterError) {
  //     return res
  //       .status(500)
  //       .json({ error: { message: `Multer uploading error: ${err.message}` } });
  //   } else if (err) {
  //     if (err.name == "ExtensionError") {
  //       return res.status(413).json({ error: { message: err.message } });
  //     } else {
  //       return res.status(500).json({
  //         error: { message: `unknown uploading error: ${err.message}` },
  //       });
  //     }
  //   }

  //   res.json({
  //     firstname: req.body.firstname,
  //     filename: req.files.map(({ filename }) => filename),
  //   });
  //   console.log("Yep yep!");
  // });
});
mongoose
  .connect(process.env.MONGO_URL, {})
  .then(() => {
    console.log("db connecttion succesasfully");
  })
  .catch((error) => {
    console.log(error.message);
  });
const server = app.listen(process.env.PORT, () => {
  console.log(`conntected with port ${process.env.PORT}`);
});
const io = socket(server, {
  maxHttpBufferSize: 1e8,
  cors: {
    origin: ["http://localhost:5173", "http://192.168.1.4:5173"],
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("user-login", (userId) => {
    onlineUsers.set(userId, socket.id);
  });
  socket.on("join-room", (room) => {
    // socket.join(room)
    // for group functionality
  });
  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("receive-msg", data);
    }
  });
  socket.on("disconnect", () => {
    console.log("user dissconect", socket.id);
    console.log("onlineUsers disconnect", onlineUsers);
  });
});

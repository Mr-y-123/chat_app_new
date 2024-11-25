const router = require("express").Router();
let fileupload = require("express-fileupload");
const {
  sendMessage,
  getAllMessage,
  uploadFile,
} = require("../controllers/messageController");
router.post("/sendmessage", sendMessage);
router.post("/getallmessage", getAllMessage);
module.exports = router;

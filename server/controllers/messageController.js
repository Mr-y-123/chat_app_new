const messageModel = require("../models/messageModel");
module.exports.sendMessage = async (req, res, next) => {
  try {
    const { from, to, message, type } = req.body;
    const data = await messageModel.create({
      message: { text: message },
      users: [from, to],
      sender: from,
      m_type: type,
    });
    if (data)
      return res.json({ status: true, message: "message added successfully" });
    return res.json({ status: false, message: "message does not send to DB" });
  } catch (error) {
    console.log(error);
  }
};

module.exports.getAllMessage = async (req, res, next) => {
  try {
    const { from, to } = req.body;
    const messages = await messageModel
      .find({ users: { $all: [from, to] } })
      .sort({ updateAt: 1 });
    const projectMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
        m_type: msg.m_type,
      };
    });
    res.json(projectMessages);
  } catch (error) {
    console.log("error", error);
  }
};

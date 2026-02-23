const chatService = require("../services/chatService");

const sendMessage = async (req, res, next) => {
  try {
    const message = await chatService.sendMessage(req.body);
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const messages = await chatService.getMessages(
      req.params.appointmentId,
      req.query.since
    );
    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const result = await chatService.markAsRead(
      req.params.appointmentId,
      req.body.userId
    );
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getMessages, markAsRead };

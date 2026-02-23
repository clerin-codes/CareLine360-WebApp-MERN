const ChatMessage = require("../models/ChatMessage");

const sendMessage = async (data) => {
  const message = await ChatMessage.create(data);
  return message.populate("sender");
};

const getMessages = async (appointmentId, since = null) => {
  const query = { appointment: appointmentId };

  if (since) {
    query.createdAt = { $gt: new Date(since) };
  }

  const messages = await ChatMessage.find(query)
    .populate("sender")
    .sort("createdAt");

  return messages;
};

const markAsRead = async (appointmentId, userId) => {
  await ChatMessage.updateMany(
    {
      appointment: appointmentId,
      readBy: { $ne: userId },
    },
    {
      $addToSet: { readBy: userId },
    }
  );

  return { message: "Messages marked as read" };
};

module.exports = {
  sendMessage,
  getMessages,
  markAsRead,
};

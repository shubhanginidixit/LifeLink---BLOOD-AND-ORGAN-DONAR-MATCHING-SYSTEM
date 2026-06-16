const asyncHandler = require("express-async-handler");
const Message = require("../models/Message");
const User = require("../models/User");

const getChatHistory = asyncHandler(async (req, res) => {
  const otherUserId = req.params.userId;
  const myId = req.user._id;

  const messages = await Message.find({
    $or: [
      { sender: myId, receiver: otherUserId },
      { sender: otherUserId, receiver: myId },
    ],
  })
    .sort({ createdAt: 1 })
    .populate("sender", "profile.name")
    .populate("receiver", "profile.name");

  res.json(messages);
});

const getChatList = asyncHandler(async (req, res) => {
  const myId = req.user._id;

  const sent = await Message.aggregate([
    { $match: { sender: myId } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: "$receiver", lastMessage: { $first: "$$ROOT" } } },
  ]);

  const received = await Message.aggregate([
    { $match: { receiver: myId } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: "$sender", lastMessage: { $first: "$$ROOT" } } },
  ]);

  const convMap = new Map();

  for (const s of sent) {
    convMap.set(String(s._id), {
      userId: s._id,
      lastMessage: s.lastMessage,
    });
  }

  for (const r of received) {
    const key = String(r._id);
    if (convMap.has(key)) {
      const existing = convMap.get(key);
      if (new Date(r.lastMessage.createdAt) > new Date(existing.lastMessage.createdAt)) {
        convMap.set(key, { userId: r._id, lastMessage: r.lastMessage });
      }
    } else {
      convMap.set(key, { userId: r._id, lastMessage: r.lastMessage });
    }
  }

  const conversations = Array.from(convMap.values());

  const userIds = conversations.map((c) => c.userId);
  const users = await User.find({ _id: { $in: userIds } }).select(
    "profile.name profile.bloodGroup profile.city"
  );
  const userMap = new Map(users.map((u) => [String(u._id), u]));

  const unreadCounts = await Message.aggregate([
    { $match: { receiver: myId, read: false } },
    { $group: { _id: "$sender", count: { $sum: 1 } } },
  ]);
  const unreadMap = new Map(
    unreadCounts.map((u) => [String(u._id), u.count])
  );

  const result = conversations.map((c) => {
    const user = userMap.get(String(c.userId));
    return {
      userId: c.userId,
      name: user?.profile?.name || "User",
      bloodGroup: user?.profile?.bloodGroup || "",
      city: user?.profile?.city || "",
      lastMessage: c.lastMessage.text,
      lastMessageTime: c.lastMessage.createdAt,
      unreadCount: unreadMap.get(String(c.userId)) || 0,
    };
  });

  result.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

  res.json(result);
});

const markMessagesRead = asyncHandler(async (req, res) => {
  const otherUserId = req.params.userId;
  const myId = req.user._id;

  await Message.updateMany(
    { sender: otherUserId, receiver: myId, read: false },
    { read: true }
  );

  res.json({ success: true });
});

module.exports = { getChatHistory, getChatList, markMessagesRead };

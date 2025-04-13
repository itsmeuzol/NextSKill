const asyncHandler = require("express-async-handler");
const Chat = require("../models/ChatModel");
const User = require("../models/UserModel");

const accessChat = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).send("Please provide userId");
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    users: {
      $all: [req.user.userId.toString(), userId],
    },
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "username avatarImage email",
  });
  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user.userId, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findById(createdChat._id).populate(
        "users",
        "-password"
      );
      res.status(200).send(fullChat);
    } catch (error) {
      console.log(error);
      //   res.status(400).send(error);
      throw new Error(e.message);
    }
  }
});

const accessChatApp = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).send("Please provide userId");
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    users: {
      $all: [req.user.userId.toString(), userId],
    },
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "username avatarImage email",
  });
  if (isChat.length > 0) {
    res.status(200).json({ data: isChat[0]._id });
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user.userId, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);

      res.status(200).json({ data: createdChat._id });
    } catch (error) {
      //   res.status(400).send(error);
      throw new Error(e.message);
    }
  }
});

const fetchChats = asyncHandler(async (req, res, next) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user.userId } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (result) => {
        result = await User.populate(result, {
          path: "latestMessage.sender",
          select: "username avatarImage email",
        });
        res.status(200).send(result);
      });
  } catch (e) {
    console.log(e);
    res.status(400);
    throw new Error(e.message);
  }
});

const fetchChatsApp = asyncHandler(async (req, res, next) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user.userId } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (result) => {
        result = await User.populate(result, {
          path: "latestMessage.sender",
          select: "username avatarImage email additional professional",
        });
        res.status(200).json({ data: result });
      });
  } catch (e) {
    res.status(400);
    throw new Error(e.message);
  }
});

const createGroupChat = asyncHandler(async (req, res, next) => {
  const users = req.body.users;

  if (!users || users.length < 2) {
    return res.status(400).send("Please select at least two users");
  }

  // Prevent duplicate user
  if (!users.includes(req.user.userId)) {
    users.push(req.user.userId);
  }

  try {
    const groupChat = await Chat.create({
      chatName: req.body.groupName,
      isGroupChat: true,
      users: users,
      groupAdmin: req.user.userId,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (e) {
    res.status(400);
    throw new Error(e.message);
  }
});

const renameGroup = asyncHandler(async (req, res, next) => {
  const { chatId, chatName } = req.body;

  // Check if the required fields are provided
  if (!chatId || !chatName) {
    return res
      .status(400)
      .json({ message: "Chat ID and Chat Name are required" });
  }

  try {
    // Attempt to find and update the chat
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName: chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    // If no chat is found, return an error response
    if (!updatedChat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Return the updated chat as the response
    res.status(200).json(updatedChat);
  } catch (error) {
    // Catch any unexpected errors and return a 500 server error
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const addToGroup = asyncHandler(async (req, res, next) => {
  const { chatId, userId } = req.body;

  try {
    const added = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      return res.status(400).json({ message: "Chat not found" });
    } else {
      return res.status(200).json(added);
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

const removeFromGroup = asyncHandler(async (req, res, next) => {
  const { chatId, userId } = req.body;

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(400).json({ message: "Chat not found" });
    }

    // ✅ Check if the user being removed is the groupAdmin
    if (chat.groupAdmin.toString() === userId.toString()) {
      // If admin is leaving, delete the whole chat
      await Chat.findByIdAndDelete(chatId);
      return res
        .status(200)
        .json({ message: "Group deleted because admin left" });
    }

    // ✅ Otherwise, it's just a member leaving
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return res.status(200).json(updatedChat);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  fetchChatsApp,
  accessChatApp,
};

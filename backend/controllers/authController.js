const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const Joi = require("joi");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const Notification = require("../models/Notification");
const CallLog = require("../models/CallLog");
const generateToken = require("../utils/generateToken");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().length(10).pattern(/^\d+$/).required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  identifier: Joi.string().required(),
  password: Joi.string().required(),
});

const resetPasswordSchema = Joi.object({
  identifier: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

// Background Verification Task
const verifyCertificateBackground = (userId, fileName) => {
  setTimeout(async () => {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const isSuccess = !/fail|invalid/i.test(fileName);
      const nextStatus = isSuccess ? 'verified' : 'failed';

      // Update the user's eligibility status
      user.profile.eligibilityStatus = nextStatus;

      // If failed, automatically turn off donor switches
      if (!isSuccess) {
        user.profile.donateBlood = false;
        user.profile.donateOrgan = false;
      }

      await user.save();

      // Create notification
      await Notification.create({
        user: userId,
        title: isSuccess ? 'Eligibility Verified' : 'Verification Failed',
        message: isSuccess
          ? 'Your medical eligibility certificate has been verified. You can now toggle donor availability.'
          : 'Medical certificate verification failed. Click here to re-upload.',
        type: isSuccess ? 'success' : 'error',
        redirect: '/dashboard/settings#eligibility'
      });
    } catch (err) {
      console.error(`Error in background verification: ${err.message}`);
    }
  }, 7000);
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.details[0].message);
  }

  const { email, phone, password } = req.body;

  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    res.status(400);
    throw new Error("Email already registered");
  }

  const existingPhone = await User.findOne({ phone });
  if (existingPhone) {
    res.status(400);
    throw new Error("Phone number already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    phone,
    password: hashedPassword,
    role: "donor",
  });

  if (user) {
    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileComplete: user.profileComplete,
        profile: user.profile,
        blockedIds: user.blockedIds
      },
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.details[0].message);
  }

  const { identifier, password } = req.body;

  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }]
  });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileComplete: user.profileComplete,
        profile: user.profile,
        blockedIds: user.blockedIds
      },
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid credentials");
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { error } = resetPasswordSchema.validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.details[0].message);
  }

  const { identifier, newPassword } = req.body;

  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }]
  });

  if (!user) {
    res.status(404);
    throw new Error("Account not found");
  }

  if (!user.password) {
    res.status(400);
    throw new Error("This account uses Google Sign-In. Password reset is not available.");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ success: true });
});

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({
    success: true,
    user
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const profileData = req.body;

  // Track if eligibilityStatus is becoming 'processing'
  const isNowProcessing = profileData.eligibilityStatus === 'processing' && user.profile.eligibilityStatus !== 'processing';

  // Merge profile data
  user.profile = {
    ...user.profile,
    ...profileData
  };
  
  user.profileComplete = true;

  await user.save();

  if (isNowProcessing) {
    verifyCertificateBackground(user._id, user.profile.eligibilityFileName);
  }

  res.json({
    success: true,
    user: {
      _id: user._id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileComplete: user.profileComplete,
      profile: user.profile,
      blockedIds: user.blockedIds
    }
  });
});

// @desc    Delete user account
// @route   POST /api/auth/delete
// @access  Private
const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.password) {
    if (!password) {
      res.status(400);
      throw new Error("Password is required");
    }
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      res.status(400);
      throw new Error("Incorrect password");
    }
  }

  await CallLog.deleteMany({ user: user._id });
  await Notification.deleteMany({ user: user._id });
  await User.findByIdAndDelete(user._id);

  res.json({ success: true });
});

// @desc    Block a donor
// @route   POST /api/auth/block/:donorId
// @access  Private
const blockDonor = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { donorId } = req.params;
  if (!user.blockedIds.includes(donorId)) {
    user.blockedIds.push(donorId);
    await user.save();
  }

  res.json({ success: true, blockedIds: user.blockedIds });
});

// @desc    Unblock a donor
// @route   POST /api/auth/unblock/:donorId
// @access  Private
const unblockDonor = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { donorId } = req.params;
  user.blockedIds = user.blockedIds.filter(id => id !== donorId);
  await user.save();

  res.json({ success: true, blockedIds: user.blockedIds });
});

// @desc    Save FCM token for push notifications
// @route   POST /api/auth/fcm-token
// @access  Private
const saveFCMToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) {
    res.status(400);
    throw new Error("Token is required");
  }

  await User.findByIdAndUpdate(req.user._id, { fcmToken: token });
  res.json({ success: true });
});

// @desc    Login/Register with Google
// @route   POST /api/auth/google
// @access  Public
const googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    res.status(400);
    throw new Error("Google credential is required");
  }

  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  } catch (err) {
    res.status(401);
    throw new Error("Invalid Google credential");
  }

  const payload = ticket.getPayload();
  const { sub: googleId, email, name, picture } = payload;

  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
    }
    if (picture && !user.avatar) {
      user.avatar = picture;
    }
    await user.save();
  } else {
    user = await User.create({
      email,
      googleId,
      avatar: picture || "",
      role: "donor",
      profile: {
        name: name || "",
      },
    });
  }

  res.json({
    success: true,
    user: {
      _id: user._id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileComplete: user.profileComplete,
      profile: user.profile,
      blockedIds: user.blockedIds,
    },
    token: generateToken(user._id),
  });
});

module.exports = {
  registerUser,
  loginUser,
  resetPassword,
  getMe,
  updateProfile,
  deleteAccount,
  blockDonor,
  unblockDonor,
  saveFCMToken,
  googleAuth,
};



const User = require('../models/User');

// 1. User Register (Saves Email & Password to MongoDB)
exports.registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered. Please login.' });
    }

    const newUser = await User.create({
      email: email.toLowerCase(),
      password: password,
      balance: 0,
      country: 'India'
    });

    console.log(`[User Registered] ✅ Email: ${newUser.email} saved to MongoDB`);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      user: { _id: newUser._id, email: newUser.email, balance: newUser.balance }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server Error during registration' });
  }
};

// 2. User Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ success: false, message: 'This email is not registered!' });
    }

    if (user.password !== password) {
      return res.status(400).json({ success: false, message: 'Your password is wrong!' });
    }

    console.log(`[User Login] ✅ Email: ${user.email} logged in`);

    res.json({
      success: true,
      message: 'Login successful!',
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        balance: user.balance
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server Error during login' });
  }
};

// 3. Forgot Password / Reset Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'This email is not registered!' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully! Please login with your new password.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while resetting password' });
  }
};

// 4. Change Password (From Account Page)
exports.changePassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found!' });
    }

    if (user.password !== oldPassword) {
      return res.status(400).json({ success: false, message: 'Old password is incorrect!' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error changing password' });
  }
};

// 5. Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    let user = null;

    if (userId && userId.length === 24) {
      user = await User.findById(userId);
    }
    if (!user) {
      user = await User.findOne();
    }

    if (!user) {
      return res.status(200).json({
        success: true,
        user: { nickname: '', firstName: '', lastName: '', dateOfBirth: '', aadhaar: '', email: '', address: '', country: 'India', balance: 0 }
      });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error('Error in getUserProfile:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 6. Update User Profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { nickname, firstName, lastName, dateOfBirth, aadhaar, email, address, country, balance } = req.body;

    const updateData = { nickname, firstName, lastName, dateOfBirth, aadhaar, address, country };
    if (balance !== undefined) updateData.balance = Number(balance);

    let query = {};
    if (id && id.length === 24) query = { _id: id };
    else if (email) query = { email: email.toLowerCase() };
    else query = {};

    const updatedUser = await User.findOneAndUpdate(query, { $set: updateData }, { new: true, upsert: true });

    res.json({
      success: true,
      message: 'Profile saved successfully in MongoDB!',
      user: updatedUser
    });
  } catch (err) {
    console.error('Error in updateUserProfile:', err);
    res.status(500).json({ success: false, message: 'Failed to save profile' });
  }
};

// 7. Delete User Account Permanently
exports.deleteUserAccount = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ success: true, message: 'Account deleted successfully from MongoDB' });
  } catch (err) {
    console.error('Error in deleteUserAccount:', err);
    res.status(500).json({ success: false, message: 'Failed to delete account' });
  }
};
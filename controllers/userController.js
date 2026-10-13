// const User = require('../models/User');

// // 1. User Register (Saves Email & Password to MongoDB with $0 initial balance)
// exports.registerUser = async (req, res) => {
//   try {
//     const { email, password, country } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ success: false, message: 'Email and password are required' });
//     }

//     const normalizedEmail = email.toLowerCase().trim();
//     const existingUser = await User.findOne({ email: normalizedEmail });
//     if (existingUser) {
//       return res.status(400).json({ success: false, message: 'Email is already registered. Please login.' });
//     }

//     const newUser = await User.create({
//       email: normalizedEmail,
//       password: password,
//       balance: 0,
//       country: country || 'India',
//       avatarEmoji: '👨‍💻',
//       isVerified: false
//     });

//     console.log(`[User Registered] ✅ Email: ${newUser.email} saved to MongoDB with $0 initial balance`);

//     res.status(201).json({
//       success: true,
//       message: 'Registration successful!',
//       user: {
//         _id: newUser._id,
//         email: newUser.email,
//         balance: 0,
//         avatarEmoji: newUser.avatarEmoji,
//         isVerified: newUser.isVerified
//       }
//     });
//   } catch (error) {
//     console.error('Register error:', error);
//     res.status(500).json({ success: false, message: 'Server Error during registration' });
//   }
// };

// // 2. User Login
// exports.loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ success: false, message: 'Email and password are required' });
//     }

//     const normalizedEmail = email.toLowerCase().trim();
//     const user = await User.findOne({ email: normalizedEmail });
//     if (!user) {
//       return res.status(400).json({ success: false, message: 'This email is not registered!' });
//     }

//     if (user.password !== password) {
//       return res.status(400).json({ success: false, message: 'Your password is wrong!' });
//     }

//     console.log(`[User Login] ✅ Email: ${user.email} logged in. Live Balance: $${user.balance}`);

//     res.json({
//       success: true,
//       message: 'Login successful!',
//       user: {
//         _id: user._id,
//         email: user.email,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         nickname: user.nickname,
//         balance: Number(user.balance || 0),
//         avatarEmoji: user.avatarEmoji || '👨‍💻',
//         isVerified: !!user.isVerified
//       }
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ success: false, message: 'Server Error during login' });
//   }
// };

// // 3. Forgot Password / Reset Password
// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email, newPassword } = req.body;
//     const normalizedEmail = (email || '').toLowerCase().trim();
//     const user = await User.findOne({ email: normalizedEmail });

//     if (!user) {
//       return res.status(404).json({ success: false, message: 'This email is not registered!' });
//     }

//     user.password = newPassword;
//     await user.save();

//     res.json({ success: true, message: 'Password reset successfully! Please login with your new password.' });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Server error while resetting password' });
//   }
// };

// // 4. Change Password (From Account Page)
// exports.changePassword = async (req, res) => {
//   try {
//     const { userId, oldPassword, newPassword } = req.body;
//     if (!userId) {
//       return res.status(400).json({ success: false, message: 'User ID is required' });
//     }

//     let user = null;
//     if (userId.length === 24) {
//       user = await User.findById(userId);
//     }
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found!' });
//     }

//     if (user.password !== oldPassword) {
//       return res.status(400).json({ success: false, message: 'Old password is incorrect!' });
//     }

//     user.password = newPassword;
//     await user.save();

//     res.json({ success: true, message: 'Password changed successfully!' });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Server error changing password' });
//   }
// };

// // 5. Get User Profile (Strictly Isolated by User ID / Email)
// exports.getUserProfile = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const email = req.query.email || req.headers['x-user-email'];
//     let user = null;

//     if (userId && userId.length === 24) {
//       user = await User.findById(userId);
//     }
//     if (!user && email) {
//       user = await User.findOne({ email: email.toLowerCase().trim() });
//     }

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User profile not found',
//         user: null
//       });
//     }

//     res.json({
//       success: true,
//       user: {
//         _id: user._id,
//         nickname: user.nickname || '',
//         firstName: user.firstName || '',
//         lastName: user.lastName || '',
//         dateOfBirth: user.dateOfBirth || '',
//         aadhaar: user.aadhaar || '',
//         email: user.email,
//         address: user.address || '',
//         country: user.country || 'India',
//         balance: Number(user.balance || 0),
//         avatarEmoji: user.avatarEmoji || '👨‍💻',
//         isVerified: !!user.isVerified
//       }
//     });
//   } catch (err) {
//     console.error('Error in getUserProfile:', err);
//     res.status(500).json({ success: false, message: 'Server Error' });
//   }
// };

// // 6. Update User Profile
// exports.updateUserProfile = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { 
//       nickname, firstName, lastName, dateOfBirth, 
//       aadhaar, email, address, country, balance, 
//       avatarEmoji, isVerified 
//     } = req.body;

//     let query = null;
//     if (id && id.length === 24) {
//       query = { _id: id };
//     } else if (email) {
//       query = { email: email.toLowerCase().trim() };
//     }

//     if (!query) {
//       return res.status(400).json({ success: false, message: 'Valid userId or email is required' });
//     }

//     const updateData = {};
//     if (nickname !== undefined) updateData.nickname = nickname;
//     if (firstName !== undefined) updateData.firstName = firstName;
//     if (lastName !== undefined) updateData.lastName = lastName;
//     if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
//     if (aadhaar !== undefined) updateData.aadhaar = aadhaar;
//     if (address !== undefined) updateData.address = address;
//     if (country !== undefined) updateData.country = country;
//     if (avatarEmoji !== undefined) updateData.avatarEmoji = avatarEmoji;
//     if (isVerified !== undefined) updateData.isVerified = isVerified;
//     if (balance !== undefined && !isNaN(Number(balance))) {
//       updateData.balance = Number(balance);
//     }

//     const updatedUser = await User.findOneAndUpdate(
//       query, 
//       { $set: updateData }, 
//       { new: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ success: false, message: 'User not found in database' });
//     }

//     res.json({
//       success: true,
//       message: 'Profile saved successfully in MongoDB!',
//       user: updatedUser
//     });
//   } catch (err) {
//     console.error('Error in updateUserProfile:', err);
//     res.status(500).json({ success: false, message: 'Failed to save profile' });
//   }
// };

// // 7. Delete User Account Permanently
// exports.deleteUserAccount = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!id || id.length !== 24) {
//       return res.status(400).json({ success: false, message: 'Valid User ID is required' });
//     }

//     await User.findByIdAndDelete(id);
//     res.json({ success: true, message: 'Account deleted successfully from MongoDB' });
//   } catch (err) {
//     console.error('Error in deleteUserAccount:', err);
//     res.status(500).json({ success: false, message: 'Failed to delete account' });
//   }
// };



const User = require('../models/User');

// 1. User Register (Saves Email & Password to MongoDB with $0 initial balance)
exports.registerUser = async (req, res) => {
  try {
    const { email, password, country } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered. Please login.' });
    }

    const newUser = await User.create({
      email: normalizedEmail,
      password: password,
      balance: 0,
      country: country || 'India',
      avatarEmoji: '👨‍💻',
      isVerified: false
    });

    console.log(`[User Registered] ✅ Email: ${newUser.email} saved to MongoDB with $0 initial balance`);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      user: {
        _id: newUser._id,
        email: newUser.email,
        balance: 0,
        avatarEmoji: newUser.avatarEmoji,
        isVerified: newUser.isVerified
      }
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

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ success: false, message: 'This email is not registered!' });
    }

    if (user.password !== password) {
      return res.status(400).json({ success: false, message: 'Your password is wrong!' });
    }

    console.log(`[User Login] ✅ Email: ${user.email} logged in. Live Balance: $${user.balance}`);

    res.json({
      success: true,
      message: 'Login successful!',
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        nickname: user.nickname,
        balance: Number(user.balance || 0),
        avatarEmoji: user.avatarEmoji || '👨‍💻',
        isVerified: !!user.isVerified
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
    const normalizedEmail = (email || '').toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

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
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    let user = null;
    if (userId.length === 24) {
      user = await User.findById(userId);
    }
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

// 5. Get User Profile (Strictly Isolated by User ID / Email)
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const email = req.query.email || req.headers['x-user-email'];
    let user = null;

    if (userId && userId.length === 24) {
      user = await User.findById(userId);
    }
    if (!user && email) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
        user: null
      });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        nickname: user.nickname || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        dateOfBirth: user.dateOfBirth || '',
        aadhaar: user.aadhaar || '',
        email: user.email,
        address: user.address || '',
        country: user.country || 'India',
        balance: Number(user.balance || 0),
        avatarEmoji: user.avatarEmoji || '👨‍💻',
        isVerified: !!user.isVerified
      }
    });
  } catch (err) {
    console.error('Error in getUserProfile:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 6. Update User Profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nickname, firstName, lastName, dateOfBirth, 
      aadhaar, email, address, country, balance, 
      avatarEmoji, isVerified 
    } = req.body;

    let query = null;
    if (id && id.length === 24) {
      query = { _id: id };
    } else if (email) {
      query = { email: email.toLowerCase().trim() };
    }

    if (!query) {
      return res.status(400).json({ success: false, message: 'Valid userId or email is required' });
    }

    const updateData = {};
    if (nickname !== undefined) updateData.nickname = nickname;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (aadhaar !== undefined) updateData.aadhaar = aadhaar;
    if (address !== undefined) updateData.address = address;
    if (country !== undefined) updateData.country = country;
    if (avatarEmoji !== undefined) updateData.avatarEmoji = avatarEmoji;
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (balance !== undefined && !isNaN(Number(balance))) {
      updateData.balance = Number(balance);
    }

    const updatedUser = await User.findOneAndUpdate(
      query, 
      { $set: updateData }, 
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found in database' });
    }

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
    if (!id || id.length !== 24) {
      return res.status(400).json({ success: false, message: 'Valid User ID is required' });
    }

    await User.findByIdAndDelete(id);
    res.json({ success: true, message: 'Account deleted successfully from MongoDB' });
  } catch (err) {
    console.error('Error in deleteUserAccount:', err);
    res.status(500).json({ success: false, message: 'Failed to delete account' });
  }
};
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { firstName, email, password, role, phoneNumber } = req.body;

    // 1. Validate input
    if (!firstName || !email || !password || !role || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 2. Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // 3. Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create user
    const user = await User.create({
      firstName,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      phoneNumber,
    });

    // 6. Prepare response (DTO)
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
    };

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: userResponse,
    });

  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 1. Validate input
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password and role are required",
      });
    }

    // 2. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 3. Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 4. Validate role
    if (user.role !== role) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized role access",
      });
    }

    // 5. Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    // 6. Sanitize user response
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      profile: user.profile,
    };

    // 7. Send response with secure cookie
    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: `Welcome back, ${user.firstName}`,
        user: userResponse,
      });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const logout = (req, res) => {
  try {
    return res
      .status(200)
      .cookie("token", "", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        expires: new Date(0), // immediately expire
      })
      .json({
        success: true,
        message: "Logged out successfully",
      });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updatePorfile = async(req, res) => {
  try {
    const { firstName, email, bio, skills, phoneNumber } = req.body;
    const file = req.file;

    if (!firstName || !email || !skills || !bio || !phoneNumber) {
      return res.status(400).json({
        message: "Something is missing !",
        success: false,
      });
    }
    const skillsArray = skills.split(',');

    const userId = req.id; //middlware authentication
    let user = await User.findById(userId);

    if(!user){
      res.status(400).json({
        message:'User not found',
        success:false
      })
    }

    //updating the data;
    user.fullName = fullName;
    user.email = email;
    user.phoneNumber = phoneNumber;
    user.profile.bio = bio;
    user.profile.skills = skillsArray,
   
    //resume comes later here


    await user.save();

     user = {
      id: user._id,
      firstName: user.firstName,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      profile: user.profile,
    };

    return res.status(200).json({
      message:'Profile updated successfully',
      success:true,
      user
    })



  } catch (err) {
    console.log(err);
  }
};

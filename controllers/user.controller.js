import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const Register = async (req, res) => {
  try {
    const { firstName, email, password, role, phoneNumber } = req.body;

    if (!firstName || !email || !password || !role || !phoneNumber) {
      return res.status(400).json({
        message: "Something is missing !",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "User already exists",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      firstName,
      email,
      password: hashedPassword,
      role,
      phoneNumber,
    });

    return res.status(200).json({
      message: "Account created successfully!",
      success: true,
    });
  } catch (err) {
    console.log(err);
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Something is missing",
        success: false,
      });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Incorrect credentials",
        success: false,
      });
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      return res.status(400).json({
        message: "Incorrect credentials",
        success: false,
      });
    }

    if (role !== user.role) {
      return res.status(400).json({
        message: "Account does not exists with this role",
        success: false,
      });
    }
    const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    user = {
      id: user._id,
      firstName: user.firstName,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      profile: user.profile,
    };
    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
      })
      .json({
        message: `Welcome back ${user.firstName}`,
        user,
        success: true,
      });
  } catch (err) {
    console.log(err);
  }
};

export const Logout = (req, res) => {
  try {
    return res.status(200).cookie("token", { maxAge: 0 }).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (err) {
    console.log(err);
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

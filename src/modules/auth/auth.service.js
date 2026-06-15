import bcrypt from "bcryptjs";
import { User } from "./auth.model.js";
import { generateToken } from "../../utils/generateToken.js";

const signup = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const token = generateToken({
    id: user._id,
    platformRole: user.platformRole,
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      platformRole: user.platformRole,
      status: user.status,
      isActive: user.isActive,
    },
    token,
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    throw new Error("Your account is suspended");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken({
    id: user._id,
    platformRole: user.platformRole,
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      platformRole: user.platformRole,
      status: user.status,
      isActive: user.isActive,
    },
    token,
  };
};

export const authService = {
  signup,
  login,
};

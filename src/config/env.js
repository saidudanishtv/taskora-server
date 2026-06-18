import dotenv from "dotenv";

dotenv.config();

const parseAllowedOrigins = (raw) => {
  const base = raw || "http://localhost:5173";
  return base
    .split(",")
    .map((u) => u.trim().replace(/\/$/, ""))
    .filter(Boolean);
};

export const env = {
  port: process.env.PORT || 5000,
  mongodbUri:
    process.env.MONGODB_URI ||
    "mongodb+srv://saidudanish12_db_user:G3VYxTYYak5EKQNB@cluster0.f4op75u.mongodb.net/?appName=Cluster0",
  jwtSecret: process.env.JWT_SECRET || "development-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  allowedOrigins: parseAllowedOrigins(process.env.CLIENT_URL),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};

import mongoose from "mongoose";
 
let isConnected = false;
 
export const ConnectDB = async () => {
  if (isConnected) return;
 
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined");
  }
 
  try {
    await mongoose.connect(uri, {
      bufferCommands: false,
    });
 
    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
};
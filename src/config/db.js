import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDatabase = async () => {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongodbUri);
  console.log('MongoDB connected');
};


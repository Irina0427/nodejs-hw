import mongoose from 'mongoose';

export const connectMongoDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;

    if (!mongoUrl) {
      console.error('❌ MONGO_URL is not defined in environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoUrl);

    console.log('✅ MongoDB connection established successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error?.message ?? error);

   
    process.exit(1);
  }
};
import mongoose from "mongoose";

const connectDB = async () => {

    const MONGO_URI = process.env.MONGO_URI;

    try {

        const connectionResponse = await mongoose.connect(MONGO_URI);

        console.log(`MongoDB Connected Successfully`);

        console.log(`Host : ${connectionResponse.connection.host}`);

    } catch (error) {

        console.log("MongoDB Connection Error");

        console.log(error);

        process.exit(1);
    }
};

export default connectDB;
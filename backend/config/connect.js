import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // console.log(process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI)
    .then(()=>
    console.log("Connected to MongoDB"))
    .catch((error)=>console.error("Error connecting to MongoDB: ", error));
  } catch (error) {
    console.error("Error connecting to MongoDB: ", error);
  }
}
export default connectDB
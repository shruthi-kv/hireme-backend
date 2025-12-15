import mongoose from 'mongoose';

const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Mongo db connected successfully')
    }catch(err){
        console.log(`Error occurred while connecting to DB - ${err}`)
    }
}

export default connectDB;
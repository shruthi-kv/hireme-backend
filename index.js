//create server
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";

dotenv.config({});

const app = express();
const PORT = process.env.PORT || 3000;

// app.get('/home',(req,res)=>{
//     return res.status(200).json({
//         message:'I am coming from backend',
//         success:true
//     })
// })

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http//localhost:3000",
    credentials: true,
  })
);

// listen to the server

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("error", err);
  });

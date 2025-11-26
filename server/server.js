import express from "express"
import "dotenv/config"
import cors from "cors"
import http from "http"
import { connectDB } from "./lib/db.js"
import userRouter from "./routes/userRoutes.js"
import messageRouter from "./routes/messageRoutes.js"

//create express app and http server

const app = express()
const server = http.createServer(app)


//middleware setup
app.use(express.json({limit:"4mb"}));
app.use(cors());

//routes
app.use("/api/status",(req,res)=>res.send('Server is live'));
app.use('/api/auth',userRouter);
app.use('/api/messages',messageRouter)



//connect to db
await connectDB();

const PORT = process.env.PORT || 5000

server.listen(PORT,()=>console.log('server is running on port'  + " " + PORT))
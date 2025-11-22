import express from "express"
import { configDotenv } from "dotenv"
import cors from "cors"
import http from "http"
import { log } from "console"
import { console } from "inspector"

//create express app and http server

const app = express()
const server = http.createServer(app)


//middleware setup
app.use(express.json({limit:"4mb"}));
app.use(cors());

//routes
app.use("/api/status",(req,res)=>res.send('Server is live'));

const PORT = process.env.PORT || 5000

server.listen(PORT,()=>console.log('server is running on port'  + PORT))
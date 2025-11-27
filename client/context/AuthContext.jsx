import { createContext, useEffect, useState } from "react";
import axios from 'axios'
import toast from "react-hot-toast";
import {io} from "socket.io-client"

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl

export const AuthContext = createContext();

export const AuthProvider = ({children})=>{

    const [token, setToken] = useState(localStorage.getItem("token"))
    const [authUser , setAuthUser] = useState(null)
    const [onlineUsers , setOnlineUsers] = useState([])
    const [socket, setSocket] = useState(null);


    //checl if user is authenticated annd if so , set the user data and connect the socket

    const checkAuth = async()=>{
        try{
           const {data} = await axios.get('/api/auth/check')
         if(data.success){
            setAuthUser(data.user)
            connectSocket(data.user)
         }
        }catch(error){
            toast.error(error.message)
        }
    }

    //connect socket fn to handle socket conn and online user updates
    const connectSocket = (userData)=>{
        if(!userData || socket?.connected) return true;

        const newSocket = io(backendUrl , {
            query:{
                userId : userData._id,
            }
        });
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers",(userIds)=>{
            setOnlineUsers(userIds)
        })
    }

    useEffect(()=>{
        if(token){
            axios.defaults.headers.common["token"] = token
        }
        checkAuth();
    },[])

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket
    }

    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
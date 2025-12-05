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
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    //check if user is authenticated and if so, set the user data and connect the socket
    const checkAuth = async()=>{
        // If no token exists, don't make the request
        if(!token){
            setIsCheckingAuth(false);
            return;
        }

        try{
            // Set token in header before making the request
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            
            const {data} = await axios.get('/api/auth/check')
            if(data.success){
                setAuthUser(data.user)
                connectSocket(data.user)
            }
        }catch(error){
            console.error("Auth check error:", error);
            // If 401, clear invalid token
            if(error.response?.status === 401){
                localStorage.removeItem("token");
                setToken(null);
                setAuthUser(null);
                axios.defaults.headers.common["Authorization"] = null;
            }
        } finally {
            setIsCheckingAuth(false);
        }
    }

    //login fn to handle user auth and socket conn
    const login = async(state,credentials) =>{
        try{
            const {data} = await axios.post(`/api/auth/${state}`,credentials);
            if(data.success){
                setAuthUser(data.userData);
                connectSocket(data.userData);
                // Use Authorization header with Bearer prefix
                axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
                setToken(data.token);
                localStorage.setItem("token",data.token);
                toast.success(data.message)
            } else{
                toast.error(data.message)
            }
        }catch(error){
            toast.error(error.response?.data?.message || error.message)
        }
    }

    //logout fn to handle user logout and socket disconnection
    const logout = async()=>{
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["Authorization"] = null;
        toast.success("Logged out successfully");
        if(socket){
            socket.disconnect();
        }
    }

    //update profile fn to handle user profile updates
    const updateProfile = async(body)=>{
        try{
            if (!token) {
                toast.error("No token found, please login again.");
                return;
            }
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            const {data} = await axios.put("/api/auth/update-profile",body);
            if(data.success){
                setAuthUser(data.user)
                toast.success("Profile updated successfully")
            }
        }catch(error){
            toast.error(error.response?.data?.message || error.message)
        }
    }

    //connect socket fn to handle socket conn and online user updates
    const connectSocket = (userData)=>{
        if(!userData || socket?.connected) return;
        
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
            // Use Authorization header with Bearer prefix
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
        }
        checkAuth();
    },[])

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile,
        isCheckingAuth
    }

    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
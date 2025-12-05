import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import {Toaster} from 'react-hot-toast'
import { AuthContext } from '../context/AuthContext'

const App = () => {
  const {authUser, isCheckingAuth} = useContext(AuthContext)
  
  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black">
      <Toaster/>
      <Routes>
        <Route path='/' element={authUser? <HomePage/> : <Navigate to={"/login"}/>}/>
        <Route path='/login' element={!authUser ? <LoginPage/> :<Navigate to={"/"}/> }/>
        <Route path='/profile' element={authUser ? <ProfilePage/>: <Navigate to={"/login"}/>}/>
      </Routes>
    </div>
  )
}

export default App
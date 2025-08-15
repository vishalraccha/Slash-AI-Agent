import React from 'react'
import { Route, BrowserRouter, Routes } from 'react-router-dom'
import Login from '../screens/Login.jsx'
import Home from '../screens/Home.jsx'
import Dashboard from '../screens/Dashboard.jsx'
import Project from '../screens/Project.jsx'
import Register from '../screens/Register.jsx'
import UserAuth from '../auth/UserAuth'

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/home" element={<Home />} />
                {/* <Route path="/" element={<UserAuth><Home /></UserAuth>} /> */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/project" element={<UserAuth><Project /></UserAuth>} />
                {/* <Route path="/project" element={<Project />} /> */}
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes

import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [role, setRole] = useState(null)
    const [userId, setUserId] = useState(null)
    const [userName, setUserName] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // On mount, read role, userId, userName from localStorage
        const storedRole = localStorage.getItem('userRole')
        const storedUserId = localStorage.getItem('userId')
        const storedUserName = localStorage.getItem('userName')

        if (storedRole) setRole(storedRole)
        if (storedUserId) setUserId(storedUserId)
        if (storedUserName) setUserName(storedUserName)

        setLoading(false)
    }, [])

    const login = (data) => {
        // Store tokens and user info in localStorage
        localStorage.setItem('accessToken', data.access)
        localStorage.setItem('refreshToken', data.refresh)
        localStorage.setItem('userRole', data.role)
        localStorage.setItem('userId', data.user_id)
        localStorage.setItem('userName', data.name)

        // Update state
        setRole(data.role)
        setUserId(data.user_id)
        setUserName(data.name)
    }

    const logout = () => {
        // Clear all localStorage keys
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('userRole')
        localStorage.removeItem('userId')
        localStorage.removeItem('userName')

        // Clear state
        setRole(null)
        setUserId(null)
        setUserName(null)

        // Redirect to login
        window.location.href = '/login'
    }

    const isAdmin = role === 'ccg-admin'
    const isContentCreator = role === 'content-creator'
    const isUser = role === 'user'
    const isAuthenticated = !!role

    const value = {
        role,
        userId,
        userName,
        isAdmin,
        isContentCreator,
        isUser,
        isAuthenticated,
        loading,
        login,
        logout,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

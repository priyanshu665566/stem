import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import CreateCity from './pages/CreateCity'
import CreateRoom from './pages/CreateRoom'
import MyCities from './pages/MyCities'
import MyRooms from './pages/MyRooms'
import ManageCities from './pages/ManageCities'
import ManageRooms from './pages/ManageRooms'
import ManageEvents from './pages/ManageEvents'
import ManageUsers from './pages/ManageUsers'
import Users from './pages/Users'
import MyProfile from './pages/MyProfile'
import EditCity from './pages/EditCity'
import EditRoom from './pages/EditRoom'
import EventDetails from './pages/EventDetails'
import CityComponents from './pages/CityComponents'
import RoomComponents from './pages/RoomComponents'
import ProtectedRoute, { AdminRoute, UserRoute } from './components/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import { ThemeProvider } from './context/ThemeContext'
import { EventsProvider } from './context/EventsContext'
import { AuthProvider } from './context/AuthContext'


const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <EventsProvider>
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<Navigate to='/login' />} />
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path='/reset-password' element={<ResetPassword />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path='/dashboard' element={<Dashboard />} />
                  <Route element={<UserRoute />}>
                    <Route path='/create-room' element={<CreateRoom />} />
                    <Route path='/my-cities' element={<MyCities />} />
                    <Route path='/my-rooms' element={<MyRooms />} />
                  </Route>
                  <Route path='/event-details' element={<EventDetails />} />
                  <Route path='/my-profile' element={<MyProfile />} />
                  <Route path='/edit-room/:id' element={<EditRoom />} />
                  <Route path='/edit-city/:id' element={<EditCity />} />
                  <Route path='/city-components' element={<CityComponents />} /> 
                  <Route path='/room-components' element={<RoomComponents />} />

                  {/* Admin-only routes */}
                  <Route element={<AdminRoute />}>
                    <Route path='/create-city' element={<CreateCity />} />
                    <Route path='/manage-cities' element={<ManageCities />} />
                    <Route path='/manage-rooms' element={<ManageRooms />} />
                    <Route path='/manage-events' element={<ManageEvents />} />
                    <Route path='/manage-users' element={<ManageUsers />} />
                    <Route path='/users' element={<Users />} />
                  </Route>
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </EventsProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
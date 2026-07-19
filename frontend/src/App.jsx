import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import Layout         from './components/layout/Layout.jsx';
import Home           from './pages/Home.jsx';
import Login          from './pages/auth/Login.jsx';
import Search         from './pages/Search.jsx';
import NotFound       from './pages/NotFound.jsx';
import DriverDashboard    from './pages/driver/DriverDashboard.jsx';
import PassengerDashboard from './pages/passenger/PassengerDashboard.jsx';
import AdminDashboard     from './pages/admin/AdminDashboard.jsx';
import UploadLicense from './pages/driver/UploadLicense.jsx';
import PostRide from './pages/driver/PostRide.jsx';
import RideDetails from './pages/RideDetails.jsx';
import MyBookings from './pages/passenger/MyBookings.jsx';  
import Profile from './pages/Profile.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/register"    element={<Login />} />
          <Route path="/search"      element={<Search />} />
          <Route path="/rides/:id" element={<RideDetails  />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}

          <Route path="/profile" element={
            <ProtectedRoute roles={['passenger','driver','admin']}>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/driver/dashboard" element={
            <ProtectedRoute roles={['driver']}>
              <DriverDashboard />
            </ProtectedRoute>
          } />
          <Route path="/passenger/dashboard" element={
            <ProtectedRoute roles={['passenger']}>
              <PassengerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/driver/upload-license" element={
            <ProtectedRoute roles={['driver']}>
              <UploadLicense />
            </ProtectedRoute>
          } />

          <Route path="/driver/post-ride" element={
            <ProtectedRoute roles={['driver']}>
              <PostRide />
            </ProtectedRoute>
          } />

          <Route path="/passenger/my-bookings" element={
            <ProtectedRoute roles={['passenger']}>
              <MyBookings />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
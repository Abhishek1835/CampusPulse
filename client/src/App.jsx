import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleRoute } from './routes/RoleRoute';

// Layout
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileTabBar } from './components/layout/MobileTabBar';
import { OrganizerLayout } from './components/layout/OrganizerLayout';
import { OrbBackground } from './components/ui/OrbBackground';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Events } from './pages/Events';
import { EventDetails } from './pages/EventDetails';
import { Clubs } from './pages/Clubs';
import { ClubDetails } from './pages/ClubDetails';
import { MyEvents } from './pages/MyEvents';
import { Profile } from './pages/Profile';
import { NotFound } from './pages/NotFound';
import { Unauthorized } from './pages/Unauthorized';
import { VerifyCertificate } from './pages/VerifyCertificate';
import { StudentCheckIn } from './pages/StudentCheckIn';
import { MyCertificates } from './pages/MyCertificates';

// Organizer Pages
import { Dashboard as OrganizerDashboard } from './pages/organizer/Dashboard';
import { OrganizerEvents } from './pages/organizer/Events';
import { CreateEditEvent } from './pages/organizer/CreateEditEvent';
import { Participants } from './pages/organizer/Participants';
import { ClubProfile } from './pages/organizer/ClubProfile';
import { LiveAttendance } from './pages/organizer/LiveAttendance';
import { EventCertificates } from './pages/organizer/EventCertificates';
import { Signatories } from './pages/organizer/Signatories';
import { CollegeSettings } from './pages/organizer/CollegeSettings';

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="relative min-h-screen flex flex-col transition-colors duration-300">
            {/* Ambient Background Gradient Mesh with Floating Orbs */}
            <OrbBackground />

            {/* Sticky Glass Navbar */}
            <Navbar />

            {/* Main Application Body */}
            <main className="flex-1 pb-16 md:pb-0">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/clubs" element={<Clubs />} />
                <Route path="/clubs/:slug" element={<ClubDetails />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Public Verification Routes */}
                <Route path="/verify" element={<VerifyCertificate />} />
                <Route path="/verify/:certificateId" element={<VerifyCertificate />} />

                {/* Student Protected Routes */}
                <Route
                  path="/my-events"
                  element={
                    <RoleRoute allowedRoles={['student']}>
                      <MyEvents />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/checkin"
                  element={
                    <RoleRoute allowedRoles={['student']}>
                      <StudentCheckIn />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/my-certificates"
                  element={
                    <RoleRoute allowedRoles={['student']}>
                      <MyCertificates />
                    </RoleRoute>
                  }
                />

                {/* Authenticated Profile Route */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Organizer Portal Routes */}
                <Route
                  path="/organizer"
                  element={
                    <RoleRoute allowedRoles={['organizer']}>
                      <OrganizerLayout />
                    </RoleRoute>
                  }
                >
                  <Route index element={<Navigate to="/organizer/dashboard" replace />} />
                  <Route path="dashboard" element={<OrganizerDashboard />} />
                  <Route path="events" element={<OrganizerEvents />} />
                  <Route path="events/new" element={<CreateEditEvent />} />
                  <Route path="events/:id/edit" element={<CreateEditEvent />} />
                  <Route path="events/:id/participants" element={<Participants />} />
                  <Route path="events/:id/attendance" element={<LiveAttendance />} />
                  <Route path="events/:id/certificates" element={<EventCertificates />} />
                  <Route path="signatories" element={<Signatories />} />
                  <Route path="settings" element={<CollegeSettings />} />
                  <Route path="club" element={<ClubProfile />} />
                </Route>

                {/* 404 Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            {/* Student Bottom Mobile Tab Bar */}
            <MobileTabBar />

            {/* Footer */}
            <Footer />

            {/* Global Toaster with Nature Glass Toast Theme */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--surface-glass-strong)',
                  backdropFilter: 'blur(20px) saturate(140%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(140%)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '18px',
                  boxShadow: '0 12px 36px rgba(95, 80, 55, 0.12)',
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontSize: '13.5px',
                  fontWeight: '500'
                },
                success: {
                  iconTheme: {
                    primary: '#5F7F5B',
                    secondary: '#F6F0E4'
                  }
                },
                error: {
                  iconTheme: {
                    primary: '#B9573F',
                    secondary: '#F6F0E4'
                  }
                }
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};
export default App;

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import QuickSearch from './pages/QuickSearch';
import AdvanceSearch from './pages/AdvanceSearch';
import Login from './pages/Login';
import AddBook from './pages/AddBook';
import Dashboard from './pages/Dashboard';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';

function AppContent() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased text-neutral-900 bg-[#FAFCFF] selection:bg-blue-100 selection:text-blue-900 relative">

      {/* Premium subtle background base */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#F9FBFC]">
        <div
          className="absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage: 'radial-gradient(#94A3B8 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
        <div className="absolute -top-[10%] -right-[5%] w-[60vw] h-[60vw] rounded-full opacity-85 blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, rgba(59, 130, 246, 0.12) 45%, transparent 70%)' }}
        />
        <div className="absolute top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full opacity-85 blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(29, 78, 216, 0.25) 0%, rgba(37, 99, 235, 0.12) 45%, transparent 70%)' }}
        />
        <div className="absolute top-[35%] left-[25%] w-[45vw] h-[45vw] rounded-full opacity-70 blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(14, 165, 233, 0.18) 0%, transparent 70%)' }}
        />
        <div className="absolute inset-0 opacity-[0.4] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <Navbar />

      <main className="flex-1 relative z-10 flex flex-col pt-10">


        <Routes>
          <Route path="/"               element={<Home />} />
          <Route path="/quick-search"   element={<QuickSearch />} />
          <Route path="/advance-search" element={<AdvanceSearch />} />
          <Route path="/about"         element={<AboutUs />} />
          <Route path="/contact"        element={<Contact />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/add-book"       element={
            <ProtectedRoute><AddBook /></ProtectedRoute>
          } />
          <Route path="/dashboard"      element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

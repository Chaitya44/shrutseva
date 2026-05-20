import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AdminSidebar from './components/AdminSidebar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Existing pages
import Home from './pages/Home';
import QuickSearch from './pages/QuickSearch';
import AdvanceSearch from './pages/AdvanceSearch';
import Login from './pages/Login';
import AddBook from './pages/AddBook';
import Dashboard from './pages/Dashboard';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';

// New public pages
import Bhandars from './pages/Bhandars';

// Books pages (protected)
import BooksView from './pages/BooksView';
import BooksEdit from './pages/BooksEdit';
import BooksExport from './pages/BooksExport';

// Reports pages (protected)
import DeletedBooks from './pages/DeletedBooks';
import IssuedBooks from './pages/IssuedBooks';
import OutstandingBooks from './pages/OutstandingBooks';
import BookHistory from './pages/BookHistory';
import MemberHistory from './pages/MemberHistory';
import BookIssueHistorySearch from './pages/BookIssueHistorySearch';
import Subjects from './pages/Subjects';
import MissingBooks from './pages/MissingBooks';
import CreatedBooks from './pages/CreatedBooks';
import ModifiedBooks from './pages/ModifiedBooks';

// Other protected pages
import Members from './pages/Members';
import AddBhandar from './pages/AddBhandar';

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

      {/* Public top navbar — always visible */}
      <Navbar />

      {/* Admin slide-out sidebar — only when logged in */}
      <AdminSidebar />

      <main className="flex-1 relative z-10 flex flex-col pt-10">
        <Routes>
          {/* Public routes */}
          <Route path="/"               element={<Home />} />
          <Route path="/quick-search"   element={<QuickSearch />} />
          <Route path="/advance-search" element={<AdvanceSearch />} />
          <Route path="/about"          element={<AboutUs />} />
          <Route path="/contact"        element={<Contact />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/bhandars"       element={<Bhandars />} />

          {/* Protected: Dashboard & Add Book */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/add-book"  element={<ProtectedRoute><AddBook /></ProtectedRoute>} />

          {/* Protected: Books */}
          <Route path="/books/view"   element={<ProtectedRoute><BooksView /></ProtectedRoute>} />
          <Route path="/books/edit"   element={<ProtectedRoute><BooksEdit /></ProtectedRoute>} />
          <Route path="/books/export" element={<ProtectedRoute><BooksExport /></ProtectedRoute>} />

          {/* Protected: Reports */}
          <Route path="/reports/deleted"        element={<ProtectedRoute><DeletedBooks /></ProtectedRoute>} />
          <Route path="/reports/issued"         element={<ProtectedRoute><IssuedBooks /></ProtectedRoute>} />
          <Route path="/reports/outstanding"    element={<ProtectedRoute><OutstandingBooks /></ProtectedRoute>} />
          <Route path="/reports/book-history"   element={<ProtectedRoute><BookHistory /></ProtectedRoute>} />
          <Route path="/reports/member-history" element={<ProtectedRoute><MemberHistory /></ProtectedRoute>} />
          <Route path="/reports/history-search" element={<ProtectedRoute><BookIssueHistorySearch /></ProtectedRoute>} />
          <Route path="/reports/subjects"       element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
          <Route path="/reports/missing"        element={<ProtectedRoute><MissingBooks /></ProtectedRoute>} />
          <Route path="/reports/created"        element={<ProtectedRoute><CreatedBooks /></ProtectedRoute>} />
          <Route path="/reports/modified"       element={<ProtectedRoute><ModifiedBooks /></ProtectedRoute>} />

          {/* Protected: Other */}
          <Route path="/members"     element={<ProtectedRoute><Members /></ProtectedRoute>} />
          <Route path="/add-bhandar" element={<ProtectedRoute><AddBhandar /></ProtectedRoute>} />
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

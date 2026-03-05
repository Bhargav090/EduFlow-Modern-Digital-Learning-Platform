import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseList from './pages/CourseList';
import CreateCourse from './pages/CreateCourse';
import CourseDetails from './pages/CourseDetails';
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import AdminPanel from './pages/AdminPanel';
import Onboarding from './pages/Onboarding';
import PageTransition from './components/PageTransition';
import AIChatBot from './components/AIChatBot';
import DemoPage from './pages/DemoPage';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
    
    if (!user) return <Navigate to="/login" />;

    // Redirect to onboarding if not completed and not already on onboarding page
    if (user.role === 'student' && !user.onboardingCompleted && window.location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" />;
    }

    return children;
};

const AnimatedRoutes = () => {
    const location = useLocation();
    
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
                <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
                <Route path="/dashboard" element={<PrivateRoute><PageTransition><Dashboard /></PageTransition></PrivateRoute>} />
                <Route path="/courses" element={<PrivateRoute><PageTransition><CourseList /></PageTransition></PrivateRoute>} />
                <Route path="/create-course" element={<PrivateRoute><PageTransition><CreateCourse /></PageTransition></PrivateRoute>} />
                <Route path="/course/:id" element={<PrivateRoute><PageTransition><CourseDetails /></PageTransition></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><PageTransition><Profile /></PageTransition></PrivateRoute>} />
                <Route path="/onboarding" element={<PrivateRoute><PageTransition><Onboarding /></PageTransition></PrivateRoute>} />
                <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
                <Route path="/demo" element={<PageTransition><DemoPage /></PageTransition>} />
                <Route path="/admin-pannel_ed" element={<PageTransition><AdminPanel /></PageTransition>} />
            </Routes>
        </AnimatePresence>
    );
};

function App() {
  return (
    <AuthProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <Router>
            <AnimatedRoutes />
            <AIChatBot />
        </Router>
    </AuthProvider>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Violations from './pages/Violations';
import AddViolation from './pages/AddViolation';
import Payment from './pages/Payment';
import Analytics from './pages/Analytics';
import Disputes from './pages/Disputes';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-gray-950 dark:text-gray-100 font-sans antialiased transition-colors duration-300">
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="violations" element={<Violations />} />
              <Route path="add-violation" element={<AddViolation />} />
              <Route path="payment" element={<Payment />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="disputes" element={<Disputes />} />
            </Route>
          </Routes>
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import CreatorProfile from './pages/CreatorProfile';
import TechnicianProfile from './pages/TechnicianProfile';
import AccountProfile from './pages/AccountProfile';
import ProtectedRoute from './routes/ProtectedRoute';
import './App.css';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
  path="/job-creator"
  element={
    <ProtectedRoute allowedTypes={['job_creator']}>
      <CreatorProfile />
    </ProtectedRoute>
  }
/>

<Route
  path="/technician"
  element={
    <ProtectedRoute allowedTypes={['technician']}>
      <TechnicianProfile />
    </ProtectedRoute>
  }
/>


<Route
  path="/account-profile"
  element={
    <ProtectedRoute allowedTypes={['accountant']}>
      <AccountProfile />
    </ProtectedRoute>
  }
/>
      </Routes>
    </Router>
  );
}

export default App;

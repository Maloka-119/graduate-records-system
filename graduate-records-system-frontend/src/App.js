import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import GraduateRecords from './pages/main-system/GraduateRecords .jsx';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); 

  const handleLogin = (user) => setCurrentUser(user);
  const handleLogout = () => setCurrentUser(null);

  return (
    // <Router>
    //   <Routes>
    //     <Route
    //       path="/graduates-records-system/login"
    //       element={
    //         currentUser
    //           ? <Navigate to="/graduates-records-system/records" />
    //           : authMode === 'login'
    //             ? <Login onLogin={handleLogin} onSwitchToRegister={() => setAuthMode('register')} />
    //             : <Register onSwitchToLogin={() => setAuthMode('login')} />
    //       }
    //     />
    //     <Route
    //       path="/graduates-records-system/register"
    //       element={
    //         currentUser
    //           ? <Navigate to="/graduates-records-system/records" />
    //           : <Register onSwitchToLogin={() => setAuthMode('login')} />
    //       }
    //     />
    //     <Route
    //       path="/graduates-records-system/records"
    //       element={
    //         currentUser
    //           ? <GraduateRecords currentUser={currentUser} onLogout={handleLogout} />
    //           : <Navigate to="/graduates-records-system/login" />
    //       }
    //     />
    //     <Route
    //       path="*"
    //       element={<Navigate to={currentUser ? "/graduates-records-system/records" : "/graduates-records-system/login"} />}
    //     />
    //   </Routes>
    // </Router>

    <Router>
    <Routes>
      <Route path="/" element={<Navigate to="/graduates-records-system/login" />} />
      <Route path="/graduates-records-system/login" element={<Login />} />
      <Route path="/graduates-records-system/register" element={<Register />} />
      <Route 
        path="/graduates-records-system/records" 
        element={<GraduateRecords currentUser={currentUser} onLogout={handleLogout} />} 
      />
      <Route path="*" element={<Navigate to="/graduates-records-system/login" />} />
    </Routes>
  </Router>
   

    
  );
};

export default App;



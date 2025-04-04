import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import OperatorDashboard from './components/OperatorDashboard';
import AVPDashboard from './components/AVPDashboard';
// import QADashboard from './components/QADashboard';
import MasterDashboard from './components/MasterDashboard';
import InspectionFormList from './components/InspectionFormList';
import EditableInspectionForm from './components/EditableInspectionForm';
import { AuthProvider, useAuth } from './components/AuthContext';
import QADashboard from './components/QADashboard';
import Chatbot from './components/Chatbot';

// Footer component
const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#0057a7', color: 'white' }} className="py-3 text-center w-full mt-auto">
      <div className="container mx-auto">
        <p className="text-sm">
          Built By Swajyot Technologies. 2002 – 2025.
        </p>
      </div>
    </footer>
  );
};

const InspectionFormLayout = ({ user, onLogout, children }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-300 shadow mb-4">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex justify-center">
              <img
                src="https://camo.githubusercontent.com/23528efa2ac40a4438536df8a46ff30e8d90f42a342b6bf6dbb6decb55ab8e86/68747470733a2f2f656e637279707465642d74626e302e677374617469632e636f6d2f696d616765733f713d74626e3a414e64394763517336636a7049706377394a4c4d4b6b796d3366506a746d563163506b533535784e66512673"
                alt="AGI Logo"
                className="w-16 h-auto"
              />
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => window.location.href = '/'}
              className="mr-4 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-1 px-3 rounded"
            >
              Back to Dashboard
            </button>

            <button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <div className="flex-grow">
        {children}
      </div>
      <Footer />
      {user && <Chatbot user={user} />}
    </div>
  );
};

const Layout = ({ children, user }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        {children}
      </div>
      <Footer />
      {user && <Chatbot user={user} />}
    </div>
  );
};

const AuthRouter = () => {
  const { user, isAuthenticated, logout, isOperator, isQA, isAVP, isMaster, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return; // Don't do anything while loading

    if (isAuthenticated) {
      // Only redirect if we're at the login page
      if (location.pathname === '/') {
        if (isOperator) navigate('/operator', { replace: true });
        else if (isQA) navigate('/qa', { replace: true });
        else if (isAVP) navigate('/avp', { replace: true });
        else if (isMaster) navigate('/master', { replace: true });
      }
    } else {

      if (location.pathname !== '/') {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, isOperator, isQA, isAVP, isMaster, loading, navigate, location.pathname]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">Loading...</div>
      </Layout>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        <Layout>
          <LoginPage />
        </Layout>
      } />
      <Route path="/operator" element={
        isOperator ? (
          <Layout user={user}>
            <OperatorDashboard user={user} onLogout={logout} />
          </Layout>
        ) : <Navigate to="/" replace />
      } />
      <Route path="/avp" element={
        isAVP ? (
          <Layout user={user}>
            <AVPDashboard user={user} onLogout={logout} />
          </Layout>
        ) : <Navigate to="/" replace />
      } />
      <Route path="/master" element={
        isMaster ? (
          <Layout user={user}>
            <MasterDashboard user={user} onLogout={logout} />
          </Layout>
        ) : <Navigate to="/" replace />
      } />
      <Route path="/qa" element={
        isQA ? (
          <Layout user={user}>
            <QADashboard user={user} onLogout={logout} />
          </Layout>
        ) : <Navigate to="/" replace />
      } />

      <Route path="/forms" element={
        isAuthenticated ? (
          <InspectionFormLayout user={user} onLogout={logout}>
            <InspectionFormList />
          </InspectionFormLayout>
        ) : <Navigate to="/" replace />
      } />
      <Route path="/inspection-form" element={
        isAuthenticated ? (
          <InspectionFormLayout user={user} onLogout={logout}>
            <EditableInspectionForm />
          </InspectionFormLayout>
        ) : <Navigate to="/" replace />
      } />
      <Route path="/inspection-form/:id" element={
        isAuthenticated ? (
          <InspectionFormLayout user={user} onLogout={logout}>
            <EditableInspectionForm />
          </InspectionFormLayout>
        ) : <Navigate to="/" replace />
      } />
      <Route path="/ViewInspectionForm-form/:id" element={
        isAuthenticated ? (
          <InspectionFormLayout user={user} onLogout={logout}>
            <EditableInspectionForm />
          </InspectionFormLayout>
        ) : <Navigate to="/" replace />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Login Page
const LoginPage = () => {
  const { login } = useAuth();

  const handleLogin = (userData) => {
    login(userData);
  };

  return <LoginForm onLogin={handleLogin} />;
};

// Main app with auth context provider
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AuthRouter />
      </Router>
    </AuthProvider>
  );
};

export default App;
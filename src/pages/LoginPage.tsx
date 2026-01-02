import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Scroll to top on initial load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <Layout>
      <div className="container-custom py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <LoginForm />
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
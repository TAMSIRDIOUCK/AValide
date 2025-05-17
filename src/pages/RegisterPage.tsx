import React from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuth } from '../context/AuthContext';

const RegisterPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <Layout>
      <div className="container-custom py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <RegisterForm />
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
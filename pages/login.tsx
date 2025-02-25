import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import FirebaseAuth from '../components/FirebaseAuth';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center w-full max-w-md">
        <img src="/images/LosPollosHermanosLogo.png" alt="Los Pollos Hermanos logo" className="w-32 h-32 mx-auto mb-4" />
        <hr className="border-gray-300 my-4" />
        <h2 className="text-2xl font-bold mb-4 text-left">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>
        <FirebaseAuth isLogin={isLogin} />
        <div className="text-center text-gray-600 mt-4">
          {isLogin ? (
            <button
              type="button"
              className="text-blue-500 hover:underline"
              onClick={() => setIsLogin(false)}
            >
              Create an account
            </button>
          ) : (
            <button
              type="button"
              className="text-blue-500 hover:underline"
              onClick={() => setIsLogin(true)}
            >
              Already have an account? Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
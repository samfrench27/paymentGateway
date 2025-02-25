import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebaseConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const FirebaseAuth = ({ isLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    lengthCriteria: false,
    uppercaseCriteria: false,
    lowercaseCriteria: false,
    numberCriteria: false,
    specialCharCriteria: false,
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        // User is signed in and email is verified, redirect to the home page
        router.push('/');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    validatePassword(password);
  }, [password]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        setMessage('Verification email sent. Please check your inbox.');
      }
    } catch (error) {
      handleAuthError(error);
    }
  };

  const handleAuthError = (error) => {
    switch (error.code) {
      case 'auth/invalid-email':
        setError('Invalid email address.');
        break;
      case 'auth/user-disabled':
        setError('User account is disabled.');
        break;
      case 'auth/user-not-found':
        setError('No user found with this email.');
        break;
      case 'auth/wrong-password':
        setError('Incorrect password.');
        break;
      case 'auth/email-already-in-use':
        setError('Email is already in use.');
        break;
      case 'auth/weak-password':
        setError('Password is too weak.');
        break;
      case 'auth/invalid-credential':
        setError('Invalid credentials.');
        break;
      case 'auth/invalid-login-credentials':
        setError('Invalid login credentials.');
        break;
      default:
        setError('An error occurred. Please try again.');
        break;
    }
    console.error('Error with authentication:', error);
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      handleAuthError(error);
    }
  };

  const handleGithubSignIn = async () => {
    const provider = new GithubAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      handleAuthError(error);
    }
  };

  const validatePassword = (password) => {
    const lengthCriteria = password.length >= 8;
    const uppercaseCriteria = /[A-Z]/.test(password);
    const lowercaseCriteria = /[a-z]/.test(password);
    const numberCriteria = /[0-9]/.test(password);
    const specialCharCriteria = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    setPasswordCriteria({
      lengthCriteria,
      uppercaseCriteria,
      lowercaseCriteria,
      numberCriteria,
      specialCharCriteria,
    });

    setPasswordValid(lengthCriteria && uppercaseCriteria && lowercaseCriteria && numberCriteria && specialCharCriteria);
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleAuth} className="auth-form">
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <div className="password-input-container relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-control"
            />
            <button
              type="button"
              className="toggle-password absolute right-3 top-1/2 transform -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-gray-500" />
            </button>
          </div>
          {!isLogin && (
            <div className="password-criteria mt-2">
              <p className={passwordCriteria.lengthCriteria ? 'text-green-500' : 'text-red-500'}>At least 8 characters</p>
              <p className={passwordCriteria.uppercaseCriteria ? 'text-green-500' : 'text-red-500'}>At least one uppercase letter</p>
              <p className={passwordCriteria.lowercaseCriteria ? 'text-green-500' : 'text-red-500'}>At least one lowercase letter</p>
              <p className={passwordCriteria.numberCriteria ? 'text-green-500' : 'text-red-500'}>At least one number</p>
              <p className={passwordCriteria.specialCharCriteria ? 'text-green-500' : 'text-red-500'}>At least one special character</p>
            </div>
          )}
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Success: </strong>
            <span className="block sm:inline">{message}</span>
          </div>
        )}
        <button type="submit" className={`btn ${passwordValid ? 'btn-primary' : 'btn-disabled'}`} disabled={!passwordValid && !isLogin}>{isLogin ? 'Login' : 'Sign Up'}</button>
      </form>
      <div className="divider">
        <hr className="divider-line" />
        <span className="divider-text">or</span>
        <hr className="divider-line" />
      </div>
      <div className="social-login space-y-4">
        <button onClick={handleGoogleSignIn} className="google-btn social-btn">
          <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Google Logo" />
          <span>Continue with Google</span>
        </button>
        <button type="button" onClick={handleGithubSignIn} className="py-2 px-4 max-w-md flex justify-center items-center bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 focus:ring-offset-gray-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg social-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="mr-2" viewBox="0 0 1792 1792">
            <path d="M896 128q209 0 385.5 103t279.5 279.5 103 385.5q0 251-146.5 451.5t-378.5 277.5q-27 5-40-7t-13-30q0-3 .5-76.5t.5-134.5q0-97-52-142 57-6 102.5-18t94-39 81-66.5 53-105 20.5-150.5q0-119-79-206 37-91-8-204-28-9-81 11t-92 44l-38 24q-93-26-192-26t-192 26q-16-11-42.5-27t-83.5-38.5-85-13.5q-45 113-8 204-79 87-79 206 0 85 20.5 150t52.5 105 80.5 67 94 39 102.5 18q-39 36-49 103-21 10-45 15t-57 5-65.5-21.5-55.5-62.5q-19-32-48.5-52t-49.5-24l-20-3q-21 0-29 4.5t-5 11.5 9 14 13 12l7 5q22 10 43.5 38t31.5 51l10 23q13 38 44 61.5t67 30 69.5 7 55.5-3.5l23-4q0 38 .5 88.5t.5 54.5q0 18-13 30t-40 7q-232-77-378.5-277.5t-146.5-451.5q0-209 103-385.5t279.5-279.5 385.5-103zm-477 1103q3-7-7-12-10-3-13 2-3 7 7 12 9 6 13-2zm31 34q7-5-2-16-10-9-16-3-7 5 2 16 10 10 16 3zm30 45q9-7 0-19-8-13-17-6-9 5 0 18t17 7zm42 42q8-8-4-19-12-12-20-3-9 8 4 19 12 12 20 3zm57 25q3-11-13-16-15-4-19 7t13 15q15 6 19-6zm63 5q0-13-17-11-16 0-16 11 0 13 17 11 16 0 16-11zm58-10q-2-11-18-9-16 3-14 15t18 8 14-14z"></path>
          </svg>
          Continue with GitHub
        </button>
      </div>
    </div>
  );
};

export default FirebaseAuth;
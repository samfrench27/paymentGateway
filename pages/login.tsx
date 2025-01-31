import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const Login: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [otpErrorMessage, setOtpErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(60);
  const [otpVerified, setOtpVerified] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhoto(e.target.files[0]);
    }
  };

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      if (!isLogin && password !== confirmPassword) {
        setErrorMessage('Passwords do not match');
        return;
      }

      if (!isLogin && !otpSent) {
        const payload = { email };

        try {
          const response = await fetch('/api/request-otp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          const data = await response.json();
          if (response.ok) {
            setSuccessMessage('OTP sent successfully. Please verify your email.');
            setErrorMessage('');
            setOtpSent(true);
            setStep(2); // Move to OTP verification step
          } else {
            setErrorMessage(data.message);
            setSuccessMessage('');
          }
        } catch (error) {
          setErrorMessage('Failed to send OTP. Please try again.');
          setSuccessMessage('');
          console.error('Error sending OTP:', error);
        }
      } else {
        const payload = { username, password };

        try {
          const response = await fetch('/api/authorize', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          const data = await response.json();
          if (response.ok) {
            localStorage.setItem('sessionId', data.sessionId);
            router.push('/');
          } else {
            setErrorMessage(data.message);
            setSuccessMessage('');
          }
        } catch (error) {
          setErrorMessage('Failed to login. Please try again.');
          setSuccessMessage('');
          console.error('Error logging in:', error);
        }
      }
    } else if (step === 2) {
      if (isSubmitting) return;
      setIsSubmitting(true);

      const payload = { email, otp };

      try {
        const response = await fetch('/api/verify-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (response.ok) {
          setSuccessMessage('OTP verified successfully.');
          setErrorMessage('');
          setOtpErrorMessage('');
          setOtpVerified(true);
          setStep(3); // Move to account setup step
        } else {
          setOtpErrorMessage(data.message);
          setSuccessMessage('');
        }
      } catch (error) {
        setOtpErrorMessage('Failed to verify OTP. Please try again.');
        setSuccessMessage('');
        console.error('Error verifying OTP:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else if (step === 3) {
      if (!firstName || !lastName) {
        setErrorMessage('Please fill in all fields.');
        return;
      }

      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      if (profilePhoto) {
        formData.append('profilePhoto', profilePhoto);
      }

      try {
        const response = await fetch('/api/signup', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (response.ok) {
          setSuccessMessage('Account setup completed successfully.');
          setErrorMessage('');
          // Redirect to home page
          router.push('/');
        } else {
          setErrorMessage(data.message);
          setSuccessMessage('');
        }
      } catch (error) {
        setErrorMessage('Failed to complete account setup. Please try again.');
        setSuccessMessage('');
        console.error('Error setting up account:', error);
      }
    }
  };

  const handleResendOtp = async () => {
    setTimer(60);
    // Implement OTP resend logic here
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleNextStep} className="bg-white p-8 rounded-lg shadow-lg text-left w-full max-w-md">
        <img src="/images/LosPollosHermanosLogo.png" alt="Los Pollos Hermanos logo" className="w-32 h-32 mx-auto mb-4" />
        <hr className="border-gray-300 my-4" />
        <h2 className="text-2xl font-bold mb-4 text-center">
          {step === 1 ? (isLogin ? 'Login' : 'Sign Up') : step === 2 ? 'Verify OTP' : 'Account Setup'}
        </h2>
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Success: </strong>
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}
        {otpErrorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{otpErrorMessage}</span>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            {!isLogin && (
              <div className="relative">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="relative">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ top: '50%', transform: 'translateY(-50%)' }} // Center the icon vertically
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>
            {!isLogin && (
              <div className="relative">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ top: '50%', transform: 'translateY(-50%)' }} // Center the icon vertically
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="otp">
                OTP
              </label>
              <input
                id="otp"
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <div className="text-center mt-4">
              <button
                type="button"
                className="text-blue-500 hover:underline"
                onClick={handleResendOtp}
              >
                Resend OTP
              </button>
            </div>
            <p className="text-gray-600 text-center mt-4">Time remaining: {timer} seconds</p>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <img
                  src={profilePhoto ? URL.createObjectURL(profilePhoto) : '/images/default-profile.png'}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handlePhotoChange}
                />
              </div>
            </div>
            <div className="relative">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
        )}
        <div className="flex justify-center mt-4">
          <button
            type="submit"
            className="bg-blue-400 hover:bg-blue-600 text-white font-bold py-2 px-8 rounded focus:outline-none focus:shadow-outline"
            disabled={isSubmitting && step === 2}
          >
            {step === 1 ? (isLogin ? 'Login' : 'Next') : step === 2 ? 'Verify OTP' : 'Create Account'}
          </button>
        </div>
        {!isLogin && (
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className={`h-full rounded-full ${
                  step === 1 ? 'bg-blue-400 w-1/3' : step === 2 ? 'bg-blue-400 w-2/3' : 'bg-blue-400 w-full'
                }`}
              ></div>
            </div>
          </div>
        )}
        {isLogin && (
          <div className="text-center text-gray-600 mt-4">
            <button
              type="button"
              className="text-blue-500 hover:underline"
              onClick={() => {
                setIsLogin(false);
                setOtpSent(false);
                setStep(1);
              }}
            >
              Create an account
            </button>
          </div>
        )}
        {!isLogin && (
          <div className="text-center text-gray-600 mt-4">
            <button
              type="button"
              className="text-blue-500 hover:underline"
              onClick={() => {
                setIsLogin(true);
                setOtpSent(false);
                setStep(1);
              }}
            >
              Already have an account? Login
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Login;
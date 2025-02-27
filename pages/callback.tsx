import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebaseConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import currencySymbolMap from 'currency-symbol-map';

const Callback: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setProfilePhoto(user.photoURL);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = () => {
    signOut(auth).then(() => {
      router.push('/login');
    }).catch((error) => {
      console.error('Error logging out:', error);
    });
  };

  useEffect(() => {
    // Handle the payment callback logic here
    const handlePaymentCallback = async () => {
      const { query } = router;
      const requestId = query['request-id'] as string;

      if (!requestId) {
        setError('No request ID found in the URL.');
        setLoading(false);
        return;
      }

      try {
        // Make an API call to get the payment result
        const response = await fetch(`/api/payment-result?requestId=${encodeURIComponent(requestId)}`);
        const result = await response.json();

        if (response.ok) {
          setPaymentResult(result);
          setError(null); // Clear any previous errors
        } else {
          setError(result.error || 'Failed to get payment result.');
        }
      } catch (error) {
        console.error('Error fetching payment result:', error);
        setError('Error fetching payment result.');
      } finally {
        // Ensure the skeleton blocks run for at least 5 seconds
        setTimeout(() => setLoading(false), 5000);
      }
    };

    handlePaymentCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <nav className="w-full bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" legacyBehavior>
                <a>
                  <img className="h-8 w-8" src="/images/LosPollosHermanosLogo.png" alt="Los Pollos Hermanos logo" />
                </a>
              </Link>
            </div>
            <div className="flex items-center">
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition duration-150 ease-in-out"
                >
                  <img className="h-8 w-8 rounded-full" src={profilePhoto || "/images/account-icon.png"} alt="Account" />
                </button>
                {dropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center w-full max-w-md">
          {loading ? (
            <div className="space-y-4">
              <div className="skeleton skeleton-circle mx-auto"></div>
              <div className="skeleton skeleton-title mx-auto"></div>
              <div className="skeleton skeleton-text mx-auto"></div>
              <div className="skeleton skeleton-text mx-auto"></div>
              <div className="skeleton skeleton-text mx-auto"></div>
              <div className="skeleton skeleton-text mx-auto"></div>
            </div>
          ) : (
            <>
              <img src="/images/LosPollosHermanosLogo.png" alt="Payment Gateway logo" className="w-32 h-32 mx-auto mb-4" />
              <hr className="border-gray-300 my-4" />
              <div className="space-y-4 flex flex-col items-center justify-center">
                {error && <p className="text-red-500">{error}</p>}
                {paymentResult && !error && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Payment Result</h2>
                    {paymentResult.transfer.status === 'SUCCESS' ? (
                      <div className="flex items-center justify-center">
                        <FontAwesomeIcon icon="check-circle" className="text-green-500" size="3x" />
                      </div>
                    ) : (
                      <p>{paymentResult.transfer.status}</p>
                    )}
                    <p>{currencySymbolMap(paymentResult.transfer.payload.amount.currency)}{paymentResult.transfer.payload.amount.value}</p>
                    <p>{paymentResult.transfer.payload.description}</p>
                    <p>{new Date(parseInt(paymentResult.transfer.createdAtMs)).toLocaleString()}</p>
                    <p>{paymentResult.transfer.providerDetails.status}</p>
                    {/* Add more fields as needed */}
                  </div>
                )}
                <Link href="/" legacyBehavior>
                  <a className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Home</a>
                </Link>
                <div className="text-center text-gray-600 mt-4">
                  &copy; samfrench.io 2024
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Callback;
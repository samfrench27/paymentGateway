import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebaseConfig';

const Home: React.FC = () => {
  const [service, setService] = useState('');
  const [provider, setProvider] = useState('');
  const [currency, setCurrency] = useState('');
  const [amount, setAmount] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [yearlyLimit, setYearlyLimit] = useState('');
  const [error, setError] = useState({ amount: '', monthlyLimit: '', yearlyLimit: '' });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setProfilePhoto(user.photoURL);
        setLoading(false);
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

  const handleIntegerInput = (e: React.ChangeEvent<HTMLInputElement>, setValue: React.Dispatch<React.SetStateAction<string>>, field: string) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setValue(value);
      setError((prev) => ({ ...prev, [field]: '' }));
    } else {
      setError((prev) => ({ ...prev, [field]: 'Please enter a valid integer value.' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let endpoint = '';
    let payload = {};

    switch (service) {
      case 'single-immediate-payments':
        endpoint = '/api/single-immediate-payment';
        payload = { provider, currency, amount };
        break;
      case 'variable-recurring-payment':
        endpoint = '/api/variable-recurring-payment';
        payload = { provider, amountValue: amount, monthlyLimit, yearlyLimit };
        break;
      case 'account-information-service':
        endpoint = '/api/account-information-service';
        payload = { provider }; // Add any necessary payload for this service
        break;
      default:
        return;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.redirectURL) {
        window.location.href = data.redirectURL;
      } else {
        console.log('API response:', data);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <nav className="w-full bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <img className="h-8 w-8" src="/images/LosPollosHermanosLogo.png" alt="Los Pollos Hermanos logo" />
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
                    <a href="profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
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
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg text-left w-full max-w-md">
          <img src="/images/LosPollosHermanosLogo.png" alt="Payment Gateway logo" className="w-32 h-32 mx-auto mb-4" />
          <hr className="border-gray-300 my-4" />
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="provider">
                Provider
              </label>
              <select
                id="provider"
                className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-10 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              >
                <option value="">Select a provider</option>
                <option value="Token.io">Token.io</option>
                <option value="TrueLayer">TrueLayer</option>
                <option value="Yapily" disabled>Yapily (Coming soon)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="fill-current h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M7 10l5 5 5-5H7z" />
                </svg>
              </div>
            </div>
            <div className="relative">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="service">
                Service
              </label>
              <select
                id="service"
                className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-10 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                value={service}
                onChange={(e) => setService(e.target.value)}
              >
                <option value="">Select a service</option>
                <option value="single-immediate-payments">Single Immediate Payment</option>
                <option value="variable-recurring-payment">Variable Recurring Payment</option>
                <option value="account-information-service">Account Information Service</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="fill-current h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M7 10l5 5 5-5H7z" />
                </svg>
              </div>
            </div>
            {service === 'single-immediate-payments' && (
              <>
                <div className="relative">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currency">
                    Currency
                  </label>
                  <select
                    id="currency"
                    className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-10 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="">Select a currency</option>
                    <option value="GBP">GBP</option>
                    <option value="EUR">EUR</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <svg className="fill-current h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M7 10l5 5 5-5H7z" />
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
                    Amount
                  </label>
                  <input
                    id="amount"
                    type="number"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </>
            )}
            {service === 'variable-recurring-payment' && (
              <>
                <div className="relative">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
                    Amount
                  </label>
                  <input
                    id="amount"
                    type="text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={amount}
                    onChange={(e) => handleIntegerInput(e, setAmount, 'amount')}
                  />
                  {error.amount && <p className="text-red-500 text-xs italic">{error.amount}</p>}
                </div>
                <div className="relative">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="monthlyLimit">
                    Monthly Limit
                  </label>
                  <input
                    id="monthlyLimit"
                    type="text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={monthlyLimit}
                    onChange={(e) => handleIntegerInput(e, setMonthlyLimit, 'monthlyLimit')}
                  />
                  {error.monthlyLimit && <p className="text-red-500 text-xs italic">{error.monthlyLimit}</p>}
                </div>
                <div className="relative">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="yearlyLimit">
                    Yearly Limit
                  </label>
                  <input
                    id="yearlyLimit"
                    type="text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={yearlyLimit}
                    onChange={(e) => handleIntegerInput(e, setYearlyLimit, 'yearlyLimit')}
                  />
                  {error.yearlyLimit && <p className="text-red-500 text-xs italic">{error.yearlyLimit}</p>}
                </div>
              </>
            )}
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-blue-400 hover:bg-blue-600 text-white font-bold py-2 px-8 rounded focus:outline-none focus:shadow-outline"
              >
                Submit
              </button>
            </div>
            <div className="text-center text-gray-600 mt-4">
              &copy; samfrench.io 2024
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Home;
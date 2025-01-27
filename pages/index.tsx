import React, { useState } from 'react';

const Home: React.FC = () => {
  const [service, setService] = useState('');
  const [provider, setProvider] = useState('');
  const [currency, setCurrency] = useState('');
  const [amount, setAmount] = useState('');
  const [maxPaymentAmount, setMaxPaymentAmount] = useState('');
  const [maxMonthlyAmount, setMaxMonthlyAmount] = useState('');
  const [maxYearlyAmount, setMaxYearlyAmount] = useState('');
  const [error, setError] = useState({ maxPaymentAmount: '', maxMonthlyAmount: '', maxYearlyAmount: '' });

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
        payload = { provider, maxPaymentAmount, maxMonthlyAmount, maxYearlyAmount };
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
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
              <option value="Yapily">Yapily</option>
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
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="maxPaymentAmount">
                  Maximum Payment Amount
                </label>
                <input
                  id="maxPaymentAmount"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={maxPaymentAmount}
                  onChange={(e) => handleIntegerInput(e, setMaxPaymentAmount, 'maxPaymentAmount')}
                />
                {error.maxPaymentAmount && <p className="text-red-500 text-xs italic">{error.maxPaymentAmount}</p>}
              </div>
              <div className="relative">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="maxMonthlyAmount">
                  Max Monthly Amount
                </label>
                <input
                  id="maxMonthlyAmount"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={maxMonthlyAmount}
                  onChange={(e) => handleIntegerInput(e, setMaxMonthlyAmount, 'maxMonthlyAmount')}
                />
                {error.maxMonthlyAmount && <p className="text-red-500 text-xs italic">{error.maxMonthlyAmount}</p>}
              </div>
              <div className="relative">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="maxYearlyAmount">
                  Max Yearly Amount
                </label>
                <input
                  id="maxYearlyAmount"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={maxYearlyAmount}
                  onChange={(e) => handleIntegerInput(e, setMaxYearlyAmount, 'maxYearlyAmount')}
                />
                {error.maxYearlyAmount && <p className="text-red-500 text-xs italic">{error.maxYearlyAmount}</p>}
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
        </div>
      </form>
    </div>
  );
};

export default Home;
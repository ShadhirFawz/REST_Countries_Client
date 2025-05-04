import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', username: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-start bg-gradient-to-br from-gray-900 via-black to-gray-800 p-12">
      {/* Background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-transparent to-transparent opacity-50"></div>
      
      {/* Form Container */}
      <div className="relative z-10 w-full max-w-md left-20 transform translate-y-[-2%]">
        {/* Header */}
        <div className="mb-7 text-center">
          <h2 className="text-4xl font-bold text-gray-100 font-serif">
            Create Account
          </h2>
          <p className="mt-3 text-gray-400 flex items-center justify-center">
            Join with us today to{' '}
            <Link 
              to="/" 
              className="font-light pl-1 text-blue-400 transition-colors cursor-default flex items-center"
            >
              Explore the world <GlobeAltIcon className="h-5 w-5 ml-1 text-gray-400 inline-block" />
            </Link>
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800 bg-opacity-60 backdrop-blur-sm rounded-xl shadow-xl pb-12 pt-2 pl-7 pr-7 border border-gray-700">
          {error && (
            <div className="mb-0 p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded-lg">
              <div className="flex items-center text-red-300">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}
          <div className="mt-7 mb-5 border-gray-700">
            <h2 className="text-2xl font-medium text-gray-300 font-sans text-center">
              REGISTER
            </h2>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={form.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-blue-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-blue-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 bg-indigo-800 hover:bg-blue-900 cursor-pointer text-white font-serif rounded-lg transition-colors duration-300 flex justify-center items-center ${
                isLoading ? 'opacity-80' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </>
              ) : (
                'Register'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-center text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
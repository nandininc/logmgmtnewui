import React, { useState } from 'react';
import { authAPI } from './api';

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password || !selectedField) {
      setError('Please enter all fields: username, password, and select role.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const user = await authAPI.login(username, password);
      const role = user.role.toLowerCase();

      onLogin({
        id: user.id,
        role: role,
        name: user.name,
        field: selectedField,
      });
    } catch (error) {
      console.error('Login error:', error);
      setError(
        error.response?.status === 401
          ? 'Invalid username or password.'
          : 'An error occurred during login. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side with gradient background and text */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-purple-600 via-violet-500 to-purple-400 p-12 flex-col justify-center">
        <div className="max-w-md mx-auto">
          {/* Logo placeholder - in production, replace with actual logo */}
          <div className="mb-6 flex justify-center">
            <img
              src="https://camo.githubusercontent.com/23528efa2ac40a4438536df8a46ff30e8d90f42a342b6bf6dbb6decb55ab8e86/68747470733a2f2f656e637279707465642d74626e302e677374617469632e636f6d2f696d616765733f713d74626e3a414e64394763517336636a7049706377394a4c4d4b6b796d3366506a746d563163506b533535784e66512673"
              alt="AGI Logo"
              className="w-42 h-auto"
            />
          </div>
          <h1 className="text-5xl font-bold text-white mb-6">Welcome to AGI E-Log</h1>
          <p className="text-white/90 text-lg">
            Inspection system for quality assurance and monitoring.
            Log in to access your dashboard and manage inspection forms.
          </p>

          {/* Decorative elements similar to the image */}
          <div className="relative mt-16">
            <div className="absolute -top-10 left-20 w-24 h-8 bg-pink-400/50 rounded-full transform rotate-45"></div>
            <div className="absolute top-10 left-40 w-32 h-8 bg-orange-400/50 rounded-full transform -rotate-12"></div>
            <div className="absolute top-20 left-10 w-20 h-20 bg-pink-400/50 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Right side with login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-purple-600 mb-2">USER LOGIN</h2>
            <p className="text-gray-500">Sign in to continue to your dashboard</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Role selection */}
                        <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1.323l-3.954 1.582a1 1 0 00-.646.934v4.5a1 1 0 001 1h8.8a1 1 0 001-1v-4.5a1 1 0 00-.646-.934L11 4.323V3a1 1 0 00-1-1zM4.4 6.839l3.9-1.562 3.9 1.562v3.161H4.4V6.839z" clipRule="evenodd" />
                </svg>
              </div>
              <select
                id="field"
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="bg-gray-100 text-gray-900 w-full pl-10 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                disabled={loading}
              >
                <option value="">Select Role</option>
                <option value="operator">Operator</option>
                <option value="qa">QA</option>
                <option value="avp">AVP</option>
                <option value="master">Master</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {/* Username input with icon */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                className="bg-gray-100 text-gray-900 w-full pl-10 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                id="username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Password input with icon */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                className="bg-gray-100 text-gray-900 w-full pl-10 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>



            {/* Remember me and forgot password */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-gray-600">
                  Remember me
                </label>
              </div>
              <div className="text-purple-600 hover:text-purple-500 cursor-pointer">
                Forgot password?
              </div>
            </div>

            {/* Submit button */}
            <button
              className="w-full bg-gradient-to-r from-purple-600 to-purple-400 text-white font-medium py-3 px-4 rounded-full hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'LOGIN'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Powered by <span className="font-bold">Swajyot Technologies</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
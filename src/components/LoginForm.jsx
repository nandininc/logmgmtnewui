import React, { useState } from 'react';
import { authAPI } from './api';


const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="relative min-h-screen flex justify-center items-center">

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700/60 via-indigo-700/60 to-purple-800/60 z-0"></div>

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center z-[-1]"
        style={{ backgroundImage: "url('src\assets\login.avif')" }}
      ></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white/80 rounded-lg shadow-lg backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="font-bold text-3xl mb-2">AGI</div>
          <div className="text-lg font-bold">GREENPAC</div>
          <div className="w-24 h-1 bg-black mx-auto mt-2 rounded-full"></div>
          <h2 className="mt-6 text-xl font-semibold">Inspection System Login</h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role dropdown */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="field">
              Select Role
            </label>
            <select
              id="field"
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:border-blue-500"
              disabled={loading}
            >
              <option value="">-- Select Role --</option>
              <option value="operator">Operator</option>
              <option value="qa">QA</option>
              <option value="avp">AVP</option>
              <option value="master">Master</option>
            </select>
          </div>

          {/* Username input */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:border-blue-500"
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Password input */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:border-blue-500"
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <button
              className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;

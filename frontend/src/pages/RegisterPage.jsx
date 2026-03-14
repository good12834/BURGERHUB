import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  console.log('RegisterPage: render start');
  const [name, setName] = useState('');
  console.log('Hook 1: useState name');
  const [email, setEmail] = useState('');
  console.log('Hook 2: useState email');
  const [password, setPassword] = useState('');
  console.log('Hook 3: useState password');
  const [confirmPassword, setConfirmPassword] = useState('');
  console.log('Hook 4: useState confirmPassword');
  const { register } = useAuth();
  console.log('Hook 5: useAuth');
  const navigate = useNavigate();
  console.log('Hook 6: useNavigate');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const success = await register({ name, email, password });
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Register</h1>
      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-bold mb-2">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-700 font-bold mb-2">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;

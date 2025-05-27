import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    const existingUser = JSON.parse(localStorage.getItem('user'));
    if (existingUser && existingUser.email === email) {
      setError('User already exists. Please login.');
      return;
    }

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const newUser = { email, password };

    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify({ email }));

    navigate('/');
  };

  return (
    <div className={styles['login-container']}>
      <h2 className={styles.h2}>Register</h2>
      <form onSubmit={handleRegister} className={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
        {error && <p className={styles.error}>{error}</p>}
      </form>
      <p className={styles.p}>
        Already have an account? <a className={styles.a} href="/login">Login</a>
      </p>
    </div>
  );
}

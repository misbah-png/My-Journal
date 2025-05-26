import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, redirect to home
    if (localStorage.getItem('loggedIn') === 'true') {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (
      storedUser &&
      storedUser.email === email &&
      storedUser.password === password
    ) {
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('currentUser', JSON.stringify({ email }));
      navigate('/');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className={styles['login-container']}>
      <h2 className={styles.h2}>Login</h2>
      <form onSubmit={handleLogin} className={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        {error && <p className={styles.error}>{error}</p>}
      </form>
      <p className={styles.p}>
        Don&apos;t have an account?{' '}
        <a className={styles.a} href="/register">Register</a>
      </p>
    </div>
  );
}


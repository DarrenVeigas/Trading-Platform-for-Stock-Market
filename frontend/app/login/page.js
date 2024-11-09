"use client";  

import { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import Head from 'next/head';
import { toast,ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:8000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email,
        password,
      }),
    });

    const data = await response.json();
    if (!data.message){
      toast.error('Invalid Email or Password', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });}
    else{
      toast.success(data.message)
    }


    if (response.ok) {
      sessionStorage.setItem('userId', JSON.stringify(email));      
      setTimeout(() => {
        router.push('/dashboard'); 
      }, 2000);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Login</title>
        <link rel="shortcut icon" href="https://cdn-icons-png.flaticon.com/512/295/295128.png" />
      </Head>
      <ToastContainer />
      <form onSubmit={handleSubmit} className="form-container mt-5">
        <div className="row text-center">
          <i className="fa fa-user-circle-o fa-3x mt-1 mb-2"></i>
          <h5>Login to Your Account</h5>
        </div>
        <div className="mb-3">
          <label htmlFor="email"><i className="fa fa-envelope"></i> Email</label>
          <input
            type="email"
            name="email"
            id="email"
            className="form-control"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password"><i className="fa fa-lock"></i> Password</label>
          <input
            type="password"
            name="password"
            id="password"
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-success">Login</button>
        <div className="register-link text-center mt-3">
          <p>Don't have an account? <a href="/register">Register</a></p>
        </div>
      </form>
      {message && <p className="text-center text-danger mt-3">{message}</p>}
    </div>
  );
}

"use client";  // Add this line at the top

import { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import Head from 'next/head'; 

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [PAN, setPAN] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('M');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:8000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',  // Changed to JSON
      },
      body: JSON.stringify({
        name,
        email,
        PAN,
        password,
        dob,
        gender,
    }),
    });

    const data = await response.json();
    setMessage(data.message || 'Email or PAN card is already linked with an Account');

    if (response.ok) {
      setTimeout(() => {
        router.push('/login'); // Redirect to login page after successful registration
      }, 2000);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Registration</title>
        <link rel="shortcut icon" href="https://cdn-icons-png.flaticon.com/512/295/295128.png" />
      </Head>
      <form onSubmit={handleSubmit} className="form-container mt-5">
        <div className="row text-center">
          <i className="fa fa-user-circle-o fa-3x mt-1 mb-2"></i>
          <h5>Create Your Account</h5>
        </div>
        <div className="mb-3">
          <label htmlFor="name"><i className="fa fa-user"></i> Name</label>
          <input
            type="text"
            name="name"
            id="name"
            className="form-control"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email"><i className="fa fa-envelope"></i> Email</label>
          <input
            type="email"
            name="email"
            id="email"
            className="form-control"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password"><i className="fa fa-lock"></i> Password</label>
          <input
            type="password"
            name="password"
            id="password"
            className="form-control"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="PAN"><i className="fa fa-id-card"></i> PAN</label>
          <input
            type="text"
            pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
            name="PAN"
            id="PAN"
            className="form-control"
            required
            value={PAN}
            onChange={(e) => setPAN(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="dob"><i className="fa fa-calendar"></i> Date of Birth</label>
          <input
            type="date"
            name="dob"
            id="dob"
            className="form-control"
            required
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="gender"><i className="fa fa-venus-mars"></i> Gender</label>
          <select
            name="gender"
            id="gender"
            className="form-control"
            required
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>
        <button type="submit" className="btn btn-success">Create Account</button>
        <div className="login-link text-center mt-3">
          <p>I have an account <a href="/login">Login</a></p>
        </div>
      </form>
      {message && <p className="text-center text-danger mt-3">{message}</p>}
    </div>
  );
}


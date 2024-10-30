'use client';
import React, { useState,useEffect } from 'react';
import styles from '../styles/ManageFunds.module.css';

const mockTransactions = [
  { id: 1, type: 'Hold', amount: 500, date: '2024-10-01' },
  { id: 2, type: 'Release', amount: 200, date: '2024-10-15' },
  { id: 3, type: 'Hold', amount: 300, date: '2024-10-20' },
  // Add more mock transactions as needed
];

const ManageFunds = () => {
  const [amount, setAmount] = useState('');
  const [total,settotal]= useState('')
  const [transactions, setTransactions] = useState([]);  
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem('userId'); // Get userId from local storage
    if (id) {
      setUserId(id);
    }
  }, []);
  const fetchTransactions = async () => {
    if (!userId) return; 
    try {
        const response = await fetch(`http://localhost:8000/transactions?userId=${encodeURIComponent(userId)}`, {
            method: 'POST',  
            headers: { 'Content-Type': 'application/json' },
        });
      const data = await response.json();
      setTransactions(data.transactions);
      settotal(data.amount)
      console.log(data)
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchTransactions();
    }
  }, [userId]);

  const handleHoldFunds = async(type) => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        alert('Please enter a valid amount.');
        return;
      }
    try {

        const response = await fetch(`http://localhost:8000/holdFunds`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId,  amount: parseFloat(amount),type})
        });
        if (!response.ok) {
            // If the response status is 500, show the alert
            if (response.status === 500) {
              alert('You have low account balance');
            }}
        const result = await response.json();
        
        if (result.message) {
          alert(result.message);
          fetchTransactions();  // Refresh transaction history
        }
      } catch (error) {
        console.error(`Error processing ${type} funds:`, error);
    }
  };


  return (
    <div className={styles.manageFundsContainer}>
      <h1>Manage Funds</h1>
      
      <div className={styles.formContainer}>
        <label htmlFor="amount">Amount: $ {total}</label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
        />
        
        <div className={styles.buttonContainer}>
        <button onClick={() => handleHoldFunds('hold')} className={styles.holdButton}>
            Hold Funds
        </button>
        <button onClick={() => handleHoldFunds('release')} className={styles.releaseButton}>
            Release Funds
        </button>
        </div>
      </div>

      <h2>Transaction History</h2>
      {transactions.length === 0 ? (
  <p>No transactions found.</p>  // Message displayed when there are no transactions
) : (
      <table className={styles.transactionTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
        {transactions.map((transaction) => (
        <tr key={transaction.id}>
          <td>{transaction.id}</td>
          <td>{transaction.type}</td>
          <td>${transaction.amount.toFixed(2)}</td>
        </tr>
      ))}
    </tbody>
  </table>
)}
    </div>
  );
};

export default ManageFunds;

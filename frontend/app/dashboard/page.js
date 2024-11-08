"use client"; 
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import React from 'react';
import StockTable from '../components/StockTable';
import styles from '../styles/Dashboard.module.css';
import { useState,useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { toast,ToastContainer } from 'react-toastify';
const DashboardPage = () => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem('userId'); // Get userId from local storage
    if (id) {
      setUserId(id);
    }
  }, []);
  console.log(userId)
  const router = useRouter();

  const handleClick = () => {

    router.push('/managefunds');
  };
  const handleOrderHistoryClick=()=>{
    router.push('/orders')
  }
  const handleTradeHistoryClick=()=>{
    router.push('/trades')
  }
  const handlePortfolio=()=>{
    router.push('/portfolio')
  }

  const handleLogout=()=>{
    localStorage.removeItem("userid");
    router.push('/login')
    }

const handleBookedPL=()=>{
  router.push('/bookPL')
    }

  return (
    <div className={styles.dashboardContainer}>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        progress={undefined}
      />
      <Navbar 
            handleClick={handleClick} 
            handleOrderHistoryClick={handleOrderHistoryClick} 
            handlePortfolio={handlePortfolio} 
            handleLogout={handleLogout} 
            handleTradeHistoryClick={handleTradeHistoryClick}
            handleBookedPL={handleBookedPL}
            />
      <main className={styles.mainContent}>
        <StockTable />
      </main>
    </div>
  );
};

export default DashboardPage;

"use client";

import { useEffect, useState } from 'react';
import styles from '../styles/Orders.module.css';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer,toast } from 'react-toastify';
export default function Orders() {
    const [orderHistory, setOrderHistory] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Retrieve email from local storage
        const email = JSON.parse(sessionStorage.getItem('userId'));
        console.log(email); 
        if (email) {
            fetchOrders(email);
        } else {
            setError("User email not found. Please log in.");
        }
    }, []);
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
    
      const handleLogout = () => {
        sessionStorage.removeItem('userId'); 
        router.push('/login'); 
    };

    const handleBookedPL=()=>{
        localStorage.removeItem("userid");
        }


    const fetchOrders = async (userEmail) => {
        try {
            const response = await fetch(`http://localhost:8000/orders?userId=${userEmail}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error('Order History could not be fetched')
                console.error("Fetch Error:", errorData);
                setError(`Error fetching orders: ${errorData.detail}`);
                return; // Exit if there's an error
            }

            const data = await response.json();

            setOrderHistory(data.orders);
        } catch (error) {
            toast.error('Please check your internet connection')
            console.error("Network error:", error);
            setError('Network error occurred while fetching orders.');
        }
    };

    return (
        <div>
            <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        progress={undefined}
      />
        <div className={styles.dashboardContainer}>
        <Navbar 
            handleClick={handleClick} 
            handleOrderHistoryClick={handleOrderHistoryClick} 
            handlePortfolio={handlePortfolio} 
            handleLogout={handleLogout} 
            handleTradeHistoryClick={handleTradeHistoryClick}
            handleBookedPL={handleBookedPL}

            />
        </div>
      <div className={styles.container}>
        
          <h1 className={styles.title}>Your Order History</h1>
          {error && <p className={styles.error}>{error}</p>}
          <ul className={styles.orderList}>
              {orderHistory.length > 0 ? (
                  orderHistory.map((order) => (
                      <li key={order.o_id} className={styles.orderItem}>
                          <p>Symbol: {order.symbol}</p>
                          <p>Action: {order.action}</p>
                          <p>Quantity: {order.quantity}</p>
                          <p>Price: ${order.price.toFixed(2)}</p>
                          <p>Date: {new Date(order.time).toLocaleDateString()}</p>
                          <p>Status: {order.status}</p> 
                      </li>
                  ))
              ) : !error && (
                  <p>No orders found for this user.</p>
              )}
          </ul>
      </div>
      </div>
  );
}

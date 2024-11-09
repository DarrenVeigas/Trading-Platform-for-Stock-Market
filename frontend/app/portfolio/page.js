"use client";

import { useEffect, useState } from 'react';
import styles from '../styles/Orders.module.css';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer,toast } from 'react-toastify';
export default function Orders() {
    const [portfolio, setPortfolio] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Retrieve user ID from local storage
        const userId = JSON.parse(sessionStorage.getItem('userId'));
        console.log(userId); 
        if (userId) {
            fetchPortfolio(userId);
        }
    }, []);

    const fetchPortfolio = async (userId) => {
        try {
            const response = await fetch('http://localhost:8000/portfolio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ UserId: userId }) // Send UserId in JSON format
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error('Portfolio could not be retrieved')
                console.error("Fetch Error:", errorData);
                setError(`Error fetching portfolio: ${errorData.detail}`);  // Corrected error message syntax
                return;
            }

            const data = await response.json();
            console.log(data)
            setPortfolio(data);

        } catch (error) {
            toast.error('Please check your internet connection')
            console.error("Network error:", error);
            setError('Network error occurred while fetching portfolio.');
        }
    };
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
        router.push('bookPL')
        }

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
            <h1 className={styles.title}>Your Portfolio</h1>
            {error && <p className={styles.error}>{error}</p>}
            <ul className={styles.orderList}>
                {portfolio.length > 0 ? (
                    portfolio.map((item) => (
                        <li key={item.symbol} className={styles.orderItem}>
                            <p>Symbol: {item.symbol}</p>
                            <p>Quantity: {item.total_quantity ?? 'N/A'}</p>
                            <p>Unrealized P/L: {item.unrealized_profit_loss !=null? `$${item.unrealized_profit_loss.toFixed(2)}` : 'N/A'}</p>
                            <p>Realized P/L: {item.realized_profit_loss != null ? `$${item.realized_profit_loss.toFixed(2)}` : 'N/A'}</p>
                            <p>Avg CP: {item.avg_cp !=null? `$${item.avg_cp.toFixed(2)}` : 'N/A'}</p>
                        </li>
                    ))
                ) : (
                    <p>No portfolio data found for this user.</p>
                )}
            </ul>
        </div>
    </div>
    );
}

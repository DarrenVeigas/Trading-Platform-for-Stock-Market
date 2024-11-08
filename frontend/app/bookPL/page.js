'use client';
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/navigation';
import styles from '../styles/bookedPL.module.css';
import { ToastContainer, toast } from 'react-toastify';

const BookedPLPage = () => {
    const router = useRouter();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null); // Make sure this is initialized as null
    const [totalPL, setTotalPL] = useState(0);

    useEffect(() => {
        const id = localStorage.getItem('userId'); 
        if (id && userId === null) { // Check only if userId is null
            setUserId(id);
        }
    }, [userId]); // Only run once when userId changes

    const handleClick = () => router.push('/managefunds');
    const handleOrderHistoryClick = () => router.push('/orders');
    const handleTradeHistoryClick = () => router.push('/trades');
    const handlePortfolio = () => router.push('/portfolio');
    const handleLogout = () => {
        localStorage.removeItem("userId");
        router.push('/login');
    };
    const handleBookedPL = () => router.push('/booked-pl');

    useEffect(() => {
        if (userId) {
            const fetchBookedPL = async () => {
                try {
                    const response = await fetch('http://localhost:8000/bookpl', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId }) // Send the userId as JSON in the body
                    });
                    const result = await response.json();

                    const transformedData = Object.entries(result).map(([symbol, profit_loss]) => ({
                        symbol,
                        profit_loss: Number(profit_loss), // Ensure it's a number
                    }));

                    setData(transformedData);
                } catch (error) {
                    setError(`Failed to load booked P/L data: ${error.message}`);
                } finally {
                    setLoading(false);
                }
            };
            fetchBookedPL();
        }
    }, [userId]); // Only run when userId is set

    useEffect(() => {
        const sum = data.reduce((acc, item) => acc + item.profit_loss, 0);
        setTotalPL(sum);
    }, [data]); // Recalculate total P/L when `data` changes

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

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
            <Navbar
                handleClick={handleClick}
                handleOrderHistoryClick={handleOrderHistoryClick}
                handlePortfolio={handlePortfolio}
                handleLogout={handleLogout}
                handleTradeHistoryClick={handleTradeHistoryClick}
                handleBookedPL={handleBookedPL}
            />
            <div className={styles['booked-pl-container']}>
                <h2>Booked P/L</h2>

                <div className={styles.totalPL} style={{ 
                    fontSize: '1.5rem', 
                    color: totalPL >= 0 ? 'green' : 'red', 
                    fontWeight: 'bold', 
                    textAlign: 'center',
                    marginBottom: '20px'
                }}>
                    Total P/L: {totalPL >= 0 ? `+$${totalPL.toFixed(2)}` : `-$${Math.abs(totalPL).toFixed(2)}`}
                </div>

                <div className={styles['booked-pl-cards']}>
                    {data.map((item) => (
                        <div className={styles['booked-pl-card']} key={item.symbol}>
                            <h3>{item.symbol}</h3>
                            <p className={item.profit_loss >= 0 ? styles['profit'] : styles['loss']}>
                                {item.profit_loss.toLocaleString("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                })}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BookedPLPage;

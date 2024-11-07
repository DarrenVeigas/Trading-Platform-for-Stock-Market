// pages/booked-pl.js
'use client';
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/navigation';
import '../styles/bookedPL.module.css';

const BookedPLPage = () => {
    const router = useRouter();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const id = localStorage.getItem('userId'); 
        if (id) {
          setUserId(id);
        }
    }, []);

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
                    const response = await fetch(`http://localhost:8000/bookpl?userId=${encodeURIComponent(userId)}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                    });
                    const result = await response.json();

                    // Transform object into array format
                    const transformedData = Object.entries(result).map(([symbol, profit_loss]) => ({
                        symbol,
                        profit_loss,
                    }));

                    setData(transformedData);
                } catch (error) {
                    setError("Failed to load booked P/L data.");
                } finally {
                    setLoading(false);
                }
            };
            fetchBookedPL();
        }
    }, [userId]); // Fetch only when userId is set

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <Navbar
                handleClick={handleClick}
                handleOrderHistoryClick={handleOrderHistoryClick}
                handlePortfolio={handlePortfolio}
                handleLogout={handleLogout}
                handleTradeHistoryClick={handleTradeHistoryClick}
                handleBookedPL={handleBookedPL}
            />
            <div className="booked-pl-container">
                <h2>Booked P/L</h2>
                <div className="booked-pl-cards">
                    {data.map((item, index) => (
                        <div className="booked-pl-card" key={index}>
                            <h3>{item.symbol}</h3>
                            <p className={item.profit_loss >= 0 ? "profit" : "loss"}>
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

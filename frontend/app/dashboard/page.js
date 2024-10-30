"use client"; 
import { useRouter } from 'next/navigation';

// // pages/stocks.js
// import React from 'react';
// import StockCard from '../components/StockCard';
// import styles from '../styles/Stocks.module.css';

// const mockStocksData = [
//   { name: 'Apple Inc.', ticker: 'AAPL', price: 175.50, change: '+1.2%', volume: '20M' },
//   { name: 'Microsoft Corp.', ticker: 'MSFT', price: 311.20, change: '-0.8%', volume: '15M' },
//   { name: 'Alphabet Inc.', ticker: 'GOOGL', price: 2735.45, change: '+2.4%', volume: '7M' },
//   // Add more mock data as needed
// ];

// const Stocks = () => {
//   return (
//     <div className={styles.container}>
//       <h1 className={styles.heading}>Stock Dashboard</h1>
//       <div className={styles.stockList}>
//         {mockStocksData.map((stock, index) => (
//           <StockCard key={index} stock={stock} />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Stocks;
// app/dashboard/page.js
import React from 'react';
import StockTable from '../components/StockTable';
import styles from '../styles/Dashboard.module.css';
import { useState,useEffect } from 'react';
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
    // Run any other functions here if needed
    router.push('/managefunds');
  };
  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h1>Stock Dashboard</h1>
        <button onClick={handleClick}>Manage Funds</button>
        <input type="text" placeholder="Search stocks..." className={styles.searchBar} />
        <div className={styles.filters}>
          <select className={styles.filter}>
            <option value="all">All</option>
            <option value="gainers">Top Gainers</option>
            <option value="losers">Top Losers</option>
          </select>
          <select className={styles.filter}>
            <option value="nifty50">NIFTY 50</option>
            <option value="sensex">Sensex</option>
          </select>
        </div>
      </header>
      <main className={styles.mainContent}>
        <StockTable />
      </main>
    </div>
  );
};

export default DashboardPage;

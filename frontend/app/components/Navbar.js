import React from 'react';
import styles from '../styles/Dashboard.module.css';
import Link from 'next/link';

const Navbar = ({ 
  handleClick, 
  handleOrderHistoryClick, 
  handlePortfolio, 
  handleLogout, 
  handleTradeHistoryClick,
  handleBookedPL,
 }) => {
  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
      <Link href="/dashboard" passHref>
          <h1 className={`${styles.logo} ${styles.logoLink}`}>TradeWave</h1>
        </Link>
        <div className={styles.navButtons}>
          <button onClick={handlePortfolio} className={styles.navButton}>Portfolio</button>
          <button onClick={handleOrderHistoryClick} className={styles.navButton}>Order Book</button>
          <button onClick={handleClick} className={styles.navButton}>Manage Funds</button>
          <button onClick={handleTradeHistoryClick} className={styles.navButton}>Trade Book</button>
          <button onClick={handleBookedPL} className={styles.navButton}>Booked P/L</button>
        </div>
      </div>

      <input type="text" placeholder="Search stocks..." className={styles.searchBar} />

      <div className={styles.filters}>
        <select className={styles.filter}>
          <option value="all">All</option>
          <option value="gainers">Top Gainers</option>
          <option value="losers">Top Losers</option>
        </select>
        <select className={styles.filter}>
          <option value="S&P500">S&P 500</option>
          <option value="DJIA">DJIA</option>
        </select>
      </div>

      <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
    </header>
  );
};

export default Navbar;

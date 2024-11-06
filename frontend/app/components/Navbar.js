import React from 'react';
import styles from '../styles/Dashboard.module.css';

const Navbar = ({ handleClick, handleOrderHistoryClick, handlePortfolio, handleLogout }) => {
  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <h1 className={styles.logo}>TradeWave</h1>
        <div className={styles.navButtons}>
          <button onClick={handleClick} className={styles.navButton}>Manage Funds</button>
          <button onClick={handleOrderHistoryClick} className={styles.navButton}>Order History</button>
          <button onClick={handlePortfolio} className={styles.navButton}>Portfolio</button>
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

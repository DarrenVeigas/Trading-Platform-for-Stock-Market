// components/StockCard.js
import React from 'react';
import styles from '../styles/StockCard.module.css';

const StockCard = ({ stock }) => {
  return (
    <div className={styles.card}>
      <h2 className={styles.name}>{stock.name} ({stock.ticker})</h2>
      <p className={styles.price}>${stock.price.toFixed(2)}</p>
      <p className={styles.change} style={{ color: stock.change.includes('+') ? 'green' : 'red' }}>
        {stock.change}
      </p>
      <p className={styles.volume}>Volume: {stock.volume}</p>
    </div>
  );
};

export default StockCard;

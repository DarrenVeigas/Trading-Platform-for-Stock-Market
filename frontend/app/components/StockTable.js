// components/StockTable.js
import React from 'react';
import styles from '../styles/StockTable.module.css';

const mockStocksData = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 175.5, change: '+1.2%', volume: '20M' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 311.2, change: '-0.8%', volume: '15M' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2735.45, change: '+2.4%', volume: '7M' },
  // Add more mock data as needed
];

const StockTable = () => (
  <table className={styles.stockTable}>
    <thead>
      <tr>
        <th>Symbol</th>
        <th>Name</th>
        <th>Last Price</th>
        <th>% Change</th>
        <th>Volume</th>
      </tr>
    </thead>
    <tbody>
      {mockStocksData.map((stock, index) => (
        <tr key={index}>
          <td>{stock.symbol}</td>
          <td>{stock.name}</td>
          <td>${stock.price.toFixed(2)}</td>
          <td style={{ color: stock.change.includes('+') ? 'green' : 'red' }}>{stock.change}</td>
          <td>{stock.volume}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default StockTable;

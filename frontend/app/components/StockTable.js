"use client"; 
import React, { useEffect, useState } from 'react';
import styles from '../styles/StockTable.module.css';
import StockModal from './StockModal';

const StockTable = () => {
  const [stocksData, setStocksData] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  useEffect(() => {
    async function fetchStocksData() {
      try {
        const response = await fetch('http://localhost:8000/dashboard', {
          method: 'POST',
        });
        const data = await response.json();
        setStocksData(data.data);  // Assuming data is under `data` in the response
      } catch (error) {
        console.error("Error fetching stocks data:", error);
      }
    }
    fetchStocksData();
  }, []);

  if (!stocksData) {
    return <p>Loading...</p>;
  }
  const handleStockClick = (stock,symbol) => {
    setSelectedStock({ ...stock, symbol });
    };

  const closeModal = () => {
  setSelectedStock(null);
   };
//   const mockStocksData = [
//   {
//     symbol: 'AAPL',
//     name: 'Apple Inc.',
//     open: 175.5,
//     close: 177.0,
//   },
//   {
//     symbol: 'MSFT',
//     name: 'Microsoft Corp.',
//     open: 311.2,
//     close: 310.0,
//   },
//   {
//     symbol: 'GOOGL',
//     name: 'Alphabet Inc.',
//     open: 2735.45,
//     close: 2740.0,
//   },
//   {
//     symbol: 'AMZN',
//     name: 'Amazon.com Inc.',
//     open: 3345.0,
//     close: 3350.0,
//   },
//   {
//     symbol: 'TSLA',
//     name: 'Tesla Inc.',
//     open: 780.0,
//     close: 785.0,
//   },
//   // Add more mock data as needed
// ];

// const StockTable = () => {
//   const [stocksData, setStocksData] = useState(mockStocksData);
//   const [selectedStock, setSelectedStock] = useState(null);

//   const handleStockClick = (stock) => {
//     setSelectedStock(stock);
//   };

//   const closeModal = () => {
//     setSelectedStock(null);
//   };
  return (
    <>
    <table className={styles.stockTable}>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Open</th>
          <th>High</th>
          <th>Low</th>
          <th>Price</th>
          <th>Close</th>
          <th>% Change</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(stocksData).map(([symbol, stock], index) => (
          <tr key={index} onClick={() => handleStockClick(stock,symbol)}>
            <td>{symbol}</td>
            <td>${stock.open?.toFixed(2) || 'N/A'}</td>
            <td>${stock.high?.toFixed(2) || 'N/A'}</td>
            <td>${stock.low?.toFixed(2) || 'N/A'}</td>
            <td>${stock.price?.toFixed(2) || 'N/A'}</td>
            <td>${stock.close?.toFixed(2) || 'N/A'}</td>

            <td style={{ color: stock.change?.includes('+') ? 'green' : 'red' }}>
              {stock.change || 'N/A'}
            </td>
            <td>{stock.volume || 'N/A'}</td>
          </tr>
        ))}

      </tbody>
    </table>
    <StockModal stock={selectedStock} symbol={selectedStock?.symbol}  onClose={closeModal}/>
    </>
  );
};

export default StockTable;
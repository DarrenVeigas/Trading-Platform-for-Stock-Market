"use client"; 
import React, { useEffect, useState } from 'react';
import styles from '../styles/StockTable.module.css';
import StockModal from './StockModal';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer,toast } from 'react-toastify';
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
        toast.error('Cannot render stocks')
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
  return (
    <>
    <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        progress={undefined}
      />
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
          </tr>
        ))}

      </tbody>
    </table>
    {selectedStock && (
      <StockModal stock={selectedStock} symbol={selectedStock?.symbol} onClose={closeModal} />
      )}    
      </>
  );
};

export default StockTable;
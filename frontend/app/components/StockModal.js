import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns'; // Import date adapter
import styles from '../styles/StockModel.module.css';

// Register Chart.js components
Chart.register(...registerables);

const StockModal = ({ stock, symbol, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(stock ? stock.price : 0);
  const [action, setAction] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    // Fetch historical data for the stock
    const fetchStockData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/fetch_stock_data?symbol=${symbol}`);
        const data = await response.json();
        setHistoricalData(data);
        
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchStockData();
  }, [symbol]);

  if (!stock) return null;

  const handleOutsideClick = (e) => {
    if (e.target.className === styles.modalOverlay) {
      onClose();
    }
  };

  const handleActionClick = (selectedAction) => {
    setAction(selectedAction);
  };

  const handleProceedClick = () => {
    if (!action) {
      alert("Please select 'Buy' or 'Sell' before proceeding.");
      return;
    }
    console.log(`Action: ${action}, Quantity: ${quantity}, Price: ${price}`);
    onClose();
  };

  // Prepare chart data
  const chartData = {
    labels: historicalData.map((item) => item.date),
    datasets: [
      {
        label: 'Closing Price',
        data: historicalData.map((item) => item.close),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'month',
        },
      },
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <div className={styles.modalOverlay} onClick={() => onClose()}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>{symbol}</h2>

        {/* Render stock information and Buy/Sell/Close buttons above the graph */}
        <div className={styles.infoTopSection}>

          <p>Price: ${stock.price?.toFixed(2) || 'N/A'}</p>

          {/* Buy, Sell, and Close buttons */}
          <div className={styles.buttonContainer}>
          <div className={styles.actionButtons}>
            <button
              onClick={() => handleActionClick('buy')}
              className={`${styles.actionButton} ${action === 'buy' ? styles.buyActive : ''}`}
            >
              Buy
            </button>
            <button
              onClick={() => handleActionClick('sell')}
              className={`${styles.actionButton} ${action === 'sell' ? styles.sellActive : ''}`}
            >
              Sell
            </button>
            </div>
          </div>
        </div>

        <div className={styles.chartContainer}>
          <Line 
            data={chartData} 
            options={chartOptions} 
            height={300}  // Adjust as needed
            width={1100}   // Adjust as needed
          />
        </div>

        <div className={styles.inputProceedContainer}>
          <div className={styles.inputContainer}>
            <label>
              Quantity:
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={styles.inputField}
              />
            </label>
            <label>
              Price:
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={styles.inputField}
              />
            </label>
          </div>
          <button onClick={handleProceedClick} className={styles.proceed}>Proceed</button>
        </div>
      </div>
    </div>
  );
};
export default StockModal;

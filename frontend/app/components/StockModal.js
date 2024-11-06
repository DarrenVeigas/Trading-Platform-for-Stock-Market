import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns'; // Import date adapter
import styles from '../styles/StockModel.module.css';
import { toast ,ToastContainer} from 'react-toastify';

// Register Chart.js components
Chart.register(...registerables);

const StockModal = ({ stock, symbol, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(stock ? stock.price : 0);
  const [action, setAction] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [modalSymbol, setModalSymbol] = useState(symbol);
  const [email, setEmail] = useState(null);

  useEffect(() => {
    setModalSymbol(symbol); // Update modalSymbol when symbol prop changes
}, [symbol]);

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
    // Retrieve email from local storage
    const storedEmail = localStorage.getItem('userId'); 
    if (storedEmail) {
        setEmail(storedEmail); // Save the email in state
    }
}, []);

  useEffect(() => {
    // Fetch historical data for the stock
    const fetchStockData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/fetch_stock_data?symbol=${symbol}`);
        const data = await response.json();
        setHistoricalData(data);
        
      } catch (error) {
        console.error("Error fetching stock data:", error);
        toast.error('Coulld not render the stocks', {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
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

  const handleProceedClick = async() => {
    if (!action) {
      toast.warn("Please select 'Buy' or 'Sell' before proceeding.");
      return;
    }
    const orderDetails = {
      u_id: email, // Use the email state variable
      price: parseFloat(price),
      quantity: parseInt(quantity, 10),
      symbol: modalSymbol,
      action: action,
      time: new Date().toISOString(),  // Ensure this is a valid date string
  };

  console.log("Order Details:", orderDetails); // Log for debugging

  try {
      // Send order details to backend
      const response = await fetch('http://localhost:8000/orders', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderDetails),
      });

      if (response.ok) {
          const data = await response.json();
          toast.success('Order processed successfully!');
        } else {
          const errorData = await response.json();
          toast.error(`Failed to create order: ${errorData.detail}`);
          console.error("Error details:", errorData);
      }
  } catch (error) {
    toast.error('Error creating order. Please try again later.');
    console.error("Network error:", error);;
  }
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
    <div className={styles.modalOverlay} onClick={handleOutsideClick}>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        progress={undefined}
      />
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>{symbol}</h2>

        <div className={styles.infoTopSection}>

          <p>Price: ${stock.price?.toFixed(2) || 'N/A'}</p>

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

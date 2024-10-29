import React, { useState ,useEffect} from 'react';
import styles from '../styles/StockModel.module.css';

const StockModal = ({ stock, symbol,onClose }) => {
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(stock ? stock.price : 0);
    const [action, setAction] = useState(null); 
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
  
    if (!stock) return null; // Render `null` after all hooks have been defined
  
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
        // Handle the selected action (buy or sell) with the provided quantity and price
        console.log(`Action: ${action}, Quantity: ${quantity}, Price: ${price}`);
        onClose();  // Close the modal
      };
    return (
      <div className={styles.modalOverlay} onClick={handleOutsideClick}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <h2>{symbol}</h2>
          <p>Symbol: {symbol}</p>
          <p>Open Price: ${stock.open.toFixed(2)}</p>
          <p>Close Price: ${stock.close.toFixed(2)}</p>
          <p>High:${stock.high?.toFixed(2) || 'N/A'}</p>
          <p>Low: ${stock.low?.toFixed(2) || 'N/A'}</p>
          <p>Price: ${stock.price?.toFixed(2) || 'N/A'}</p>
          
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
  
          <div className={styles.buttonContainer}>
          <div className={styles.actionButtons}>
          <button 
            onClick={() => handleActionClick('buy')}
            className={`${styles.actionButton} ${action === 'buy' ? styles.activeButton : ''}`}
          >
            Buy
          </button>
          <button 
            onClick={() => handleActionClick('sell')}
            className={`${styles.actionButton} ${action === 'sell' ? styles.activeButton : ''}`}
          >
            Sell
          </button>
        </div>
            <button onClick={onClose}>Close</button>
          </div>
          <div>
          <button onClick={handleProceedClick} className={styles.proceedButton}>Proceed</button>

          </div>
        </div>
      </div>
    );
  };
  
  export default StockModal;
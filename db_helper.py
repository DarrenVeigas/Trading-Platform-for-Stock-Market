import requests
import os
from dotenv import load_dotenv
import random as r
import mysql.connector as mysql
from datetime import datetime
from tiingo import TiingoClient

load_dotenv()

api_keys = [os.getenv(f'API_KEY{i}') for i in range(1, 5)]
config = {
    'api_key': os.getenv('tAPI_KEY')
}
client = TiingoClient(config)

stock_symbols = [
    "RELIANCE", "SBIN", "BAJFINANCE", "LT", "ITC", "TITAN", "MARUTI", 
    "POWERGRID", "ADANIGREEN", "ONGC", "TATASTEEL", "M&M"
]

us_symbols=['PLUG', 'NKE', 'CRWD', 'ZM', 'NTES', 'MELI', 'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'BRK.B', 'TSLA']

data = {}

date = datetime.now()
year = date.year
month = date.month
day = date.day
date=f"{year}-{month:02}-{day:02}"


db_connection = mysql.connect(
    host='localhost',  
    user=os.getenv('DB_USER'),  
    password=os.getenv('DB_PASSWORD'), 
    database=os.getenv('DB_NAME'),
    port='3305')
cursor = db_connection.cursor()

def fetch_data(symbol):
    '''
    for api_key in api_keys:
        try:
            url = f'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={symbol}.BSE&apikey={api_key}'
            response = requests.get(url)
            
            if response.status_code == 200:
                json_data = response.json()
                if 'Time Series (Daily)' in json_data:
                    print(json_data['Time Series (Daily)'])
                    return json_data['Time Series (Daily)'][date]

                else:
                    print(f"API key {api_key} returned an invalid response for {symbol}: {json_data}")
            else:
                print(f"Error fetching data for {symbol} with API key {api_key}: {response.status_code}")

        except Exception as e:
            print(f"Exception occurred for {symbol} with API key {api_key}: {e}")
    '''
    try:
        json_data=client.get_ticker_price(symbol,frequency='intraday')
        print(json_data)
        return json_data
    except Exception as e:
        print(e)
    return None 

for symbol in us_symbols:
    result = fetch_data(f"{symbol}")
    if result:

        open=result['open']
        high=result['high']
        low=result['low']
        close=result['close']
        data[symbol] = result
        cursor.execute('''
            INSERT INTO stock_data (`symbol`, `open`, `high`, `low`, `close`, `date`) 
            VALUES (%s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE 
                `open` = VALUES(`open`), 
                `high` = VALUES(`high`),
                `low` = VALUES(`low`),
                `close` = VALUES(`close`)
            ''', (symbol, open, high, low, close, date))
        db_connection.commit()

    else:
        print(f"Failed to fetch data for {symbol} with all API keys.")
cursor.close()
db_connection.close()


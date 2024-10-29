import requests
import os
from dotenv import load_dotenv
import random as r
import mysql.connector as mysql
from datetime import datetime, timedelta

load_dotenv()

config = {
    'Content-Type': 'application/json'

}
api_key=os.getenv('tAPI_KEY1')

us_symbols=['PLUG', 'NKE', 'CRWD', 'ZM', 'NTES', 'MELI', 'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'BRK-B', 'TSLA']


now = datetime.now()
year = now.year
month = now.month
day = now.day-1

date=f"{year}-{month:02}-{day:02}"

def new_connect():
    db_connection = mysql.connect(
        host='localhost',  
        user=os.getenv('DB_USER'),  
        password=os.getenv('DB_PASSWORD'), 
        database=os.getenv('DB_NAME'),
        port='3305')
    cursor = db_connection.cursor()
    return cursor,db_connection

def difference():
    current_hour = now.hour
    current_minute = now.minute

    target_hour = 9
    target_minute = 30

    difference_in_minutes = (current_hour* 60 + current_minute) - (target_hour * 60 + target_minute)-1
    return difference_in_minutes
def fetch_data(symbol):
    
    try:
        r = requests.get(f"https://api.tiingo.com/tiingo/daily/{symbol}/prices?startDate={date}&token={api_key}", headers=config)
        return r.json()[0]
    except Exception as e:
        print(e)
    return None 

def fetch_intraday(symbol):
    try:
        url = f"https://api.tiingo.com/iex/{symbol}/prices"
        params = {
            'startDate': date,
            'resampleFreq': '1min',  
            'token': api_key
        }
        
        r = requests.get(url, params=params)
        if r.status_code == 200  :
            time=difference()
            return r.json()[time]
        else:
            print(f"Failed to fetch data: {r.status_code}")
            return None
    except Exception as e:
        print(e)
    return None 

def gen():
    query = "SELECT `date` FROM stock_data ORDER BY `sid` ASC LIMIT 1"
    cursor,conn=new_connect()
    cursor.execute(query)
    curr_date = cursor.fetchone()[0]
    d={}
    for symbol in us_symbols:

        if str(curr_date)<date:
            result = fetch_data(f"{symbol}")
            if result:

                open=result['open']
                high=result['high']
                low=result['low']
                close=result['close']
                cursor.execute('''
                    INSERT INTO stock_data (`symbol`, `open`, `high`, `low`, `price`,`close`, `date`) 
                    VALUES (%s, %s, %s, %s, %s,%s, %s)
                    ON DUPLICATE KEY UPDATE 
                        `open` = VALUES(`open`), 
                        `high` = VALUES(`high`),
                        `low` = VALUES(`low`),
                        `price`=VALUES(`price`),
                        `close` = VALUES(`close`),
                        `date`=VALUES(`date`)
                    ''', (symbol, open, high, low,open, close, date))
                d[symbol]={'open': open, 'high':high, 'low':low,'price':open, 'close':close, 'date':date}
                conn.commit()
                
            else:
                print(f"Failed to fetch data for {symbol} with all API keys.")
        else:
            result=fetch_intraday(symbol)
            if result:

                open=result['open']
                cursor.execute('''
                    update stock_data set `price`=%s
                        where `symbol`=%s
                    ''', (open,symbol))
                conn.commit()

                cursor.execute('''select * from stock_data where `symbol`=%s''',(symbol,))
                rec=cursor.fetchone()
                d[symbol]={'open': rec[2], 'high':rec[3], 'low':rec[4],'price':rec[5], 'close':rec[6]}
    cursor.close()
    conn.close()
    return d

def read_symbol(symbol):
    cursor,conn=new_connect()
    cursor.execute('''select * from stock_data where `symbol`=%s''',(symbol,))
    rec=cursor.fetchone()
    d={}
    d[symbol]={'open': rec[2], 'high':rec[3], 'low':rec[4],'price':rec[5], 'close':rec[6]}
    cursor.close()
    conn.close()
    return d

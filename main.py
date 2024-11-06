from fastapi import FastAPI, Request, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
import os,requests
from dotenv import load_dotenv
from pydantic import BaseModel, EmailStr
from db_helper_new import gen,get_wallet,hold
from datetime import datetime,timedelta

load_dotenv()
api_key=os.getenv('tAPI_KEY1')

now = datetime.now()

if now.weekday() == 0:  
    target_date = now - timedelta(days=3)  
else:
    target_date = now - timedelta(days=1)  

year = target_date.year
month = target_date.month
day = target_date.day

date = f"{year}-{month:02}-{day:02}"
final=now-timedelta(days=365*5)
year = final.year
month = final.month
day = final.day
final=f"{year}-{month:02}-{day:02}"
DATABASE_CONFIG = {
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': 'localhost',
    'database': os.getenv('DB_NAME'),
    'port': 3305
}

# Create FastAPI instance
app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:3000",  # Allow requests from this origin
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def create_connection():
    try:
        connection = mysql.connector.connect(**DATABASE_CONFIG)
        print("Connection to MySQL DB successful")
        return connection
    except Exception as e:
        print(f"The error '{e}' occurred")
        return None


@app.post("/register")
async def register(request: Request):
    try:

        form_data = await request.json()  
        

        required_fields = ['name', 'email', 'PAN', 'password', 'dob', 'gender']
        for field in required_fields:
            if field not in form_data:
                raise HTTPException(status_code=400, detail=f"Missing field: {field}")

        name = form_data['name']
        email = form_data['email']
        PAN = form_data['PAN']
        password = form_data['password']
        dob = form_data['dob']
        gender = form_data['gender']


        connection = create_connection()
        if connection is None:
            raise HTTPException(status_code=500, detail="Database connection failed")
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO users (name, email, password, PAN, dob, gender) VALUES (%s, %s, %s, %s, %s, %s)",
                    (name, email, password, PAN, dob, gender)
                )
                connection.commit()
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        finally:
            connection.close()

        return JSONResponse(content={"message": "User registered successfully!"})
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@app.post("/login")
async def login(request: Request):
    form_data = await request.form()
    email = form_data.get("email")
    password = form_data.get("password")

    connection = create_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    with connection.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT * FROM users WHERE email = %s AND password = %s", (email, password))
        user = cursor.fetchone()

    connection.close()

    if user:
        return JSONResponse(content={"message": "Login successful!"})

    raise HTTPException(status_code=400, detail="Invalid email or password")

@app.post("/dashboard")
async def dashboard():
    try:
        # Call the function with additional logging
        result=gen()
        if result is None:
            print("No data found for 'PLUG'. Check database.")
            raise HTTPException(status_code=404, detail="No data found for 'PLUG'")
        
        return JSONResponse(content={"data": result, "message": "Dashboard data retrieved successfully!"})
    
    except mysql.connector.Error as db_error:
        print(f"Database error occurred: {db_error}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(db_error)}")
    
    except Exception as e:
        print(f"Unexpected error in /dashboard endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch dashboard data: {str(e)}")
    

@app.post("/transactions")
async def transactions(userId:str ):
    try:
        if not userId:
            raise HTTPException(status_code=422, detail=userId)
        transactions = get_wallet(userId)
        return JSONResponse(content={"transactions": transactions[:-1],'amount':transactions[-1]})
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error retrieving transactions.")
    
class FundRequest(BaseModel):
    userId: str
    amount: float
    type: str

@app.post("/holdFunds")
async def transactions(request: FundRequest):
    try:
        transactions = hold(request.userId,request.amount,request.type)
        return JSONResponse(content={"transactions": transactions})
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error retrieving transactions.")


@app.get("/fetch_stock_data/")
async def fetch_stock_data(symbol: str):
    if not symbol:
        raise HTTPException(status_code=400, detail="Symbol is required")

    url = f"https://api.tiingo.com/tiingo/daily/{symbol}/prices?startDate={final}&endDate={date}"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Token {api_key}",
    }
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch data from Tiingo")

    return response.json()

class Order(BaseModel):
    u_id: str
    symbol: str
    action: str
    quantity: int
    price: float
    time: datetime = None    

@app.get("/orders")
def get_orders(userId: str):  # Assuming userId is the email
    connection = create_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    try:

        with connection.cursor(dictionary=True) as cursor:
            cursor.execute("SELECT id FROM users WHERE email = %s", (userId,))
            user = cursor.fetchone()  # Fetch the single user record

        if user is None:
            raise HTTPException(status_code=404, detail="User not found")  # Handle case where user doesn't exist
        
        user_id = user['id']  
        
        with connection.cursor(dictionary=True) as cursor:
            cursor.execute("SELECT * FROM order_history WHERE u_id = %s order by o_id desc", (user_id,))
            orders = cursor.fetchall()

        if orders:
            for order in orders:
                order['time'] = order['time'].isoformat()    
        
        if orders:
            return JSONResponse(content={"orders": orders}, status_code=200)
        else:
            return JSONResponse(content={"orders": []}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch orders")
    finally:
        connection.close()
    
@app.post("/orders")
async def create_order(order: Order):
    connection = create_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    with connection.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT id FROM users WHERE email = %s", (order.u_id,))
        user = cursor.fetchone()  
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")  # Handle case where user doesn't exist

    user_id = user['id']  # Extract user ID from the retrieved record
    with connection.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT price FROM stock_data WHERE symbol = %s", (order.symbol,))
        price_for_buy=cursor.fetchone()

    if (price_for_buy['price'] - 1.5> order.price) and order.action=="buy":
        raise HTTPException(status_code=400, detail="Please quote a higher value")

    order_time = order.time or datetime.now()
    if order.action == "buy":
        with connection.cursor(dictionary=True) as cursor:
            cursor.execute("SELECT wallet_balance FROM wallet WHERE u_id = %s ORDER BY transaction_id DESC LIMIT 1", (user_id,))
            wallet = cursor.fetchone()  # Get the most recent balance

        if wallet is None or wallet['wallet_balance'] < order.price * order.quantity:
            raise HTTPException(status_code=400, detail="Insufficient balance to place the order")

        new_balance = wallet['wallet_balance'] - (order.price * order.quantity)
        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO wallet (u_id, wallet_balance,type,changes) VALUES (%s, %s,%s,%s)", (user_id, new_balance,'buy',order.price * order.quantity))
            connection.commit()
    elif order.action=='sell':
        with connection.cursor(dictionary=True) as cursor:
            cursor.execute("SELECT wallet_balance FROM wallet WHERE u_id = %s ORDER BY transaction_id DESC LIMIT 1", (user_id,))
            wallet = cursor.fetchone() 
        if wallet is None:
            raise HTTPException(status_code=400, detail="Something went wrong!! Please try again later")
        new_balance = wallet['wallet_balance'] + (order.price * order.quantity)
        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO wallet (u_id, wallet_balance,type,changes) VALUES (%s, %s,%s,%s)", (user_id, new_balance,'sell',order.price * order.quantity))
            connection.commit()

    sql = """
    INSERT INTO order_history (u_id, price, time, quantity, symbol, action)
    VALUES (%s, %s, %s, %s, %s, %s)
    """
    values = (user_id, order.price, order_time, order.quantity, order.symbol, order.action)  # Use user_id instead of order.u_id

    try:
        with connection.cursor() as cursor:
            cursor.execute(sql, values)
            connection.commit()

        return JSONResponse(content={"message": "Order created successfully!"})
    except Exception as e:
        connection.rollback()
        print(f"Error occurred: {str(e)}")  # Log the error message
        raise HTTPException(status_code=500, detail="Failed to create order")
    finally:
        connection.close()

class UserRequest(BaseModel):
    UserId: str
    
@app.post("/portfolio")
def process_orders(order: UserRequest):
    UserId = order.UserId
    print(f"Received UserId: {UserId}")  # Log the received UserId
    connection = create_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        with connection.cursor(dictionary=True) as cursor:
            # First, retrieve the user ID from the email (order.u_id is the email)
            cursor.execute("SELECT id FROM users WHERE email = %s", (UserId,))
            user = cursor.fetchone()  # Fetch the single user record   

        if user is None:
            raise HTTPException(status_code=404, detail="User not found")

        user_id = user['id']  
        print(f"User ID: {user_id}")

        with connection.cursor(dictionary=True) as cursor:  
            query = """
            SELECT 
                symbol,
                u_id,
                SUM(CASE WHEN action = 'buy' THEN quantity ELSE -quantity END) AS total_quantity,
                SUM(CASE WHEN action = 'buy' THEN quantity * price ELSE -quantity * price END) AS total_amt_invst
            FROM order_history
            WHERE u_id = %s
            GROUP BY symbol, u_id;
            """
            cursor.execute(query, (user_id,))
            aggregated_data = cursor.fetchall()

            # If no data is found, handle it
            if not aggregated_data:
                return {"message": "No portfolio data found for this user."}

            for row in aggregated_data:
                symbol = row['symbol']  
                total_quantity = row['total_quantity']
                total_amt_invst = row['total_amt_invst']

                cursor.execute("""SELECT * FROM portfolio WHERE user_id = %s AND symbol = %s""", (user_id, symbol))
                existing_portfolio = cursor.fetchone()

                cursor.execute("SELECT price FROM stock_data WHERE symbol=%s", (symbol,))
                current_price_result = cursor.fetchone()

                if current_price_result:
                    current_price = current_price_result['price']
                    row['current_price'] = current_price

                total_revenue_curr=current_price*float(total_quantity)
                total_revenue=total_revenue_curr-float(total_amt_invst)
                row['total_revenue']=total_revenue    

                if existing_portfolio:
                    cursor.execute("""UPDATE portfolio SET quantity = %s, amt_invst = %s, curr_price=%s, total_revenue=%s WHERE user_id = %s AND symbol = %s""", (total_quantity, total_amt_invst, current_price, total_revenue, user_id, symbol))
                else:
                    cursor.execute("""INSERT INTO portfolio (symbol, quantity, amt_invst,curr_price, total_revenue, user_id) VALUES (%s, %s, %s, %s, %s, %s)""", (symbol, total_quantity, total_amt_invst, current_price, total_revenue, user_id))

            connection.commit()
            return aggregated_data  # Return the aggregated data

    except Exception as e:
        connection.rollback()
        error_message = str(e)
        print(e)
        if "Insufficient quantity for sale" in error_message:
            raise HTTPException(status_code=400, detail="Insufficient quantity for sale")
        else:
            raise HTTPException(status_code=500, detail=f"Failed to update portfolio :{str(e)}")

    finally:
        connection.close()
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


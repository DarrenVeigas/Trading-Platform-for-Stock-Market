from fastapi import FastAPI, Request, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
#from mysql.connector import Error
import os,requests
from dotenv import load_dotenv
from pydantic import BaseModel, EmailStr
from db_helper_new import gen,get_wallet,hold
from datetime import datetime,timedelta
# Load environment variables
load_dotenv()
api_key=os.getenv('tAPI_KEY1')
# Database configuration
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

# Function to create a database connection
def create_connection():
    try:
        connection = mysql.connector.connect(**DATABASE_CONFIG)
        print("Connection to MySQL DB successful")
        return connection
    except Exception as e:
        print(f"The error '{e}' occurred")
        return None

# User Registration Model

@app.post("/register")
async def register(request: Request):
    try:
        # Parse form data directly from the request
        form_data = await request.json()  # Change this to handle JSON data
        
        # Manually validate required fields
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

        # Create a database connection
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

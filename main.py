from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
#from mysql.connector import Error
import os
from dotenv import load_dotenv
from pydantic import BaseModel, EmailStr
from db_helper_new import gen,read_symbol
# Load environment variables
load_dotenv()

# Database configuration
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
        print("Data retrieved successfully:", result)
        
        return JSONResponse(content={"data": result, "message": "Dashboard data retrieved successfully!"})
    
    except mysql.connector.Error as db_error:
        print(f"Database error occurred: {db_error}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(db_error)}")
    
    except Exception as e:
        print(f"Unexpected error in /dashboard endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch dashboard data: {str(e)}")
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

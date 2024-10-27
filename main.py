'''from fastapi import FastAPI, Request, Form, HTTPException, Depends
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, EmailStr
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
from mysql.connector import Error
import enum
import uvicorn
from dotenv import load_dotenv
import os 

load_dotenv()

DATABASE_CONFIG = {
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': 'localhost',
    'database': os.getenv('DB_NAME'),
    'port':3305
}

# Define Gender Enum
class Gender(enum.Enum):
    M = "M"
    F = "F"

# Create a FastAPI instance
app = FastAPI()
templates = Jinja2Templates(directory="frontend")

# CORS configuration
origins = [
    "http://localhost:3000",  # Allow requests from this origin
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # allows requests from your front-end
    allow_credentials=True,
    allow_methods=["*"],  # allows all HTTP methods
    allow_headers=["*"],  # allows all headers
)

# Function to create a database connection
def create_connection():
    try:
        connection = mysql.connector.connect(**DATABASE_CONFIG)
        print("Connection to MySQL DB successful")
        return connection
    except Error as e:
        print(f"The error '{e}' occurred")
        return None

# Function to check if the user exists
# def user_exists(email: str, PAN: str) -> bool:
#     connection = create_connection()
#     if connection is None:
#         return False
#     with connection.cursor(dictionary=True) as cursor:
#         cursor.execute("SELECT * FROM users WHERE email = %s OR PAN = %s", (email, PAN))
#         user = cursor.fetchone()
#     connection.close()
#     return user is not None

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

@app.post("/register")
async def register(
    request: Request,
    name: str = Form(...),
    email: EmailStr = Form(...),
    PAN: str = Form(...),
    password: str = Form(...),
    dob: str = Form(...),
    gender: Gender = Form(...)
):

    connection = create_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
        
    # if user_exists(email, PAN):
    #     connection.close()
    #     raise HTTPException(status_code=400, detail="User already exists")

    try:
        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO users (name, email, password, PAN, dob, gender) VALUES (%s, %s, %s, %s, %s, %s)",
                           (name, email, password, PAN, dob, gender.value))
            connection.commit()
    except Exception as e:
        #connection.rollback()
        raise HTTPException(status_code=400, detail=str(e)+"9")
    finally:
        connection.close()
    
    return {"message": "User registered successfully!"}

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

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
        return {"message": "Login successful!"}
    
    raise HTTPException(status_code=400, detail="Invalid email or password")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
'''

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
#from mysql.connector import Error
import os
from dotenv import load_dotenv
from pydantic import BaseModel, EmailStr

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

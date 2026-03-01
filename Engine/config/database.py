from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()
connection_string = os.getenv("ATLAS_URI")

client = AsyncIOMotorClient(connection_string)
database = client["deepsquare"]
collection = database["games"]
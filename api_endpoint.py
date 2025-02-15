import fastapi as api
import ConvertKPtoCoord as data
from fastapi.middleware.cors import CORSMiddleware

app = api.FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this if your frontend runs on a different URL
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
async def root():
    return {"message": "Hello World!"}

@app.get("/accidentList")
async def accidents():
    return data.createAccidentCoords()

@app.get("/radarList")
async def radars():
    return data.createRadarCoords()

@app.get("/hotZones")
async def hotzones():
    zones = data.createZoneCoords()
    return zones
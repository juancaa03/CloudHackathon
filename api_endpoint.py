import fastapi as api
import ConvertKPtoCoord as data

app = api.FastAPI()

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
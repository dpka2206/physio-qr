from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from config import settings
from routers import auth, doctors, patients, exercises, prescriptions

app = FastAPI(title="PhysioQR API")

cors_origins = [settings.FRONTEND_URL, "http://localhost:3000"]
cors_origins.extend(settings.cors_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(set(cors_origins)), # deduplicate if necessary
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(doctors.router)
app.include_router(patients.router)
app.include_router(exercises.router)
app.include_router(prescriptions.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error", "detail": str(exc)},
    )

@app.get("/")
def root():
    return {"message": "PhysioQR Backend API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

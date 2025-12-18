from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth import router as auth_router
from app.api.hod import router as hod_router
from app.api.faculty import router as faculty_router
from app.api.student import router as student_router

app = FastAPI(title="SmartAttend API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["authentication"])
app.include_router(hod_router, prefix="/api/hod", tags=["hod"])
app.include_router(faculty_router, prefix="/api/faculty", tags=["faculty"])
app.include_router(student_router, prefix="/api/student", tags=["student"])

@app.get("/")
async def root():
    return {"message": "SmartAttend API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
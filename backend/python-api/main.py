"""
SmartAttend Hub - Main API Entry Point
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time

# Import routers
from app.api.auth import router as auth_router
from app.api.hod import router as hod_router
from app.api.faculty import router as faculty_router
from app.api.student import router as student_router
from app.api.attendance import router as attendance_router
from app.api.analytics import router as analytics_router
from app.api.ai import router as ai_router
from app.api.webhooks import router as webhooks_router

# Import database
from app.database import init_db
from app.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown"""
    # Startup
    print("🚀 Starting SmartAttend Hub API...")
    init_db()
    print(f"✅ API Version: {settings.APP_VERSION}")
    yield
    # Shutdown
    print("👋 Shutting down SmartAttend Hub API...")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Comprehensive Attendance Management System API",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-Process-Time"]
)

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(round(process_time * 1000, 2)) + "ms"
    return response

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": str(exc) if settings.DEBUG else "An unexpected error occurred",
            "path": str(request.url)
        }
    )

# ============================================
# API Routes
# ============================================

# Authentication
app.include_router(
    auth_router, 
    prefix="/api/auth", 
    tags=["🔐 Authentication"]
)

# HOD Management
app.include_router(
    hod_router, 
    prefix="/api/hod", 
    tags=["🎓 HOD Management"]
)

# Faculty Operations
app.include_router(
    faculty_router, 
    prefix="/api/faculty", 
    tags=["👨‍🏫 Faculty"]
)

# Student Portal
app.include_router(
    student_router, 
    prefix="/api/student", 
    tags=["👨‍🎓 Student"]
)

# Attendance Management
app.include_router(
    attendance_router, 
    prefix="/api/attendance", 
    tags=["📋 Attendance"]
)

# Analytics & Reports
app.include_router(
    analytics_router, 
    prefix="/api/analytics", 
    tags=["📊 Analytics"]
)

# AI/ML Features
app.include_router(
    ai_router, 
    prefix="/api/ai", 
    tags=["🤖 AI/ML"]
)

# n8n Webhooks
app.include_router(
    webhooks_router, 
    prefix="/api/webhooks", 
    tags=["🔗 Webhooks"]
)

# ============================================
# Health & Info Endpoints
# ============================================

@app.get("/", tags=["🏠 Root"])
async def root():
    """API Root - Health Check"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health", tags=["🏠 Root"])
async def health_check():
    """Health check endpoint"""
    from app.database import supabase
    
    db_status = "connected" if supabase else "disconnected"
    
    return {
        "status": "healthy",
        "database": db_status,
        "version": settings.APP_VERSION
    }

@app.get("/api/info", tags=["🏠 Root"])
async def api_info():
    """API Information"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "endpoints": {
            "auth": "/api/auth",
            "hod": "/api/hod",
            "faculty": "/api/faculty",
            "student": "/api/student"
        },
        "docs": {
            "swagger": "/docs",
            "redoc": "/redoc"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8003, 
        reload=settings.DEBUG
    )
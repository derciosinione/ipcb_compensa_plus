from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import chat
import nest_asyncio

nest_asyncio.apply()

app = FastAPI(title="CompensaAI", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api/chat", tags=["chat"])

@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "compensa-ai"}

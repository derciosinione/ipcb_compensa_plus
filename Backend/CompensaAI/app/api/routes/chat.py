import os
import tempfile
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.api.auth import get_current_user_context
from app.services.ai_coordinator import ai_coordinator

router = APIRouter()

class ChatRequest(BaseModel):
    thread_id: Optional[str] = None
    message: str
    file_ids: Optional[List[str]] = None
    user_context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    thread_id: str
    response_type: str
    content: Optional[str] = None
    action: Optional[str] = None
    data: Optional[dict] = None

@router.post("/message", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    user_context: Dict[str, Any] = Depends(get_current_user_context),
):
    try:
        thread_id = request.thread_id
        if not thread_id:
            thread_id = await ai_coordinator.create_thread()

        result = await ai_coordinator.send_message(
            thread_id=thread_id,
            content=request.message,
            file_ids=request.file_ids,
            user_context=user_context
        )

        response = ChatResponse(
            thread_id=thread_id,
            response_type=result.get("type", "error"),
            content=result.get("content"),
            action=result.get("action"),
            data=result.get("data")
        )
        
        # If the coordinator swapped to Gemini, make sure we return the new thread ID
        if "thread_id" in result and result["thread_id"]:
            response.thread_id = result["thread_id"]
            
        return response
    except Exception as e:
        import traceback
        print(f"CHAT ROUTE ERROR: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    _user_context: Dict[str, Any] = Depends(get_current_user_context),
):
    try:
        # Save file temporarily to upload to OpenAI
        with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name

        file_id = await ai_coordinator.upload_file(temp_file_path)
        
        # Cleanup
        os.unlink(temp_file_path)

        return {"file_id": file_id, "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

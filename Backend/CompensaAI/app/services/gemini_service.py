import json
import time
import uuid
import logging
import asyncio
from typing import Any, Dict, List, Optional
import google.generativeai as genai
from app.core.config import get_settings
from app.services.core_api_service import core_api_service

settings = get_settings()
logger = logging.getLogger(__name__)

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

COMPENSA_INSTRUCTIONS = """
You are Compensa IA, a highly intelligent and versatile assistant for the Compensa+ platform at IPCB.
Your mission is to provide comprehensive support for all users: Teachers, Course Coordinators, and Administrators.

Dynamic Capabilities:
1. Real-time Information: Use the provided tools to fetch live data about:
   - Curricular Units (UCs) and Courses.
   - Schedules and Classrooms (finding free/occupied rooms).
   - Compensation Requests (listing, tracking status, detailed view).
   - Academic Years and Courses in the system.
2. Document Intelligence: Analyze uploaded files (PDFs, Excel, etc.) to extract structured data.
3. Task Automation: 
   - Help draft compensation requests (CreateCompensationRequest action).
   - Help Coordinators/Admins approve or reject requests directly in chat.
   - Search for information about any course or UC.

User Profiles & Context:
- Teacher: Focus on their specific UCs, their own schedule, and their requests.
- Coordinator: Can see data for their course, including requests from other teachers that need approval. They can APPROVE or REJECT requests.
- Admin: Has full access to the system and can perform any action.

Status Codes for Requests:
1 = Pending, 2 = Approved, 3 = Rejected, 4 = Cancelled.

Always base your responses on the provided system context (User ID, Role, etc.) and strictly adhere to the scope of the Compensa+ project.
Be helpful, proactive, and precise. If a tool returns an error, explain it politely to the user.
"""

# Tool Definitions for Gemini
def create_compensation_request(courseId: str, unitId: str, originalDate: str, proposedDate: str, reason: str):
    """Call this when a user wants to create or draft a compensation request. This returns an action for the UI to handle."""
    pass

def get_user_assignments(userId: str):
    """Gets curricular units and courses assigned to the specified user."""
    pass

def get_available_rooms(date: str, startTime: str, endTime: str):
    """Checks for available classrooms for a specific date and time range (format: YYYY-MM-DD, HH:MM)."""
    pass

def get_my_compensation_requests(teacherUserId: Optional[str] = None, status: Optional[int] = None):
    """Lists compensation requests. Teachers see their own; Coordinators/Admins can filter by teacher or status (1=Pending, 2=Approved, 3=Rejected, 4=Cancelled)."""
    pass

def get_request_details(requestId: str):
    """Gets full details of a specific compensation request including its history and reason."""
    pass

def update_request_status(requestId: str, status: int, reason: str):
    """Updates the status of a compensation request. 2=Approved, 3=Rejected. Mandatory for Coordinators/Admins to provide a reason."""
    pass

def get_courses(search: Optional[str] = None):
    """Lists or searches for courses in the system."""
    pass

def get_course_details(courseId: str):
    """Gets full details of a course, including its curricular units (UCs) and general info."""
    pass

def get_academic_years():
    """Lists the academic years available in the system (e.g., 2023/24)."""
    pass

class CompensaGemini_Service:
    def __init__(self):
        self.sessions: Dict[str, Any] = {}
        self.model = genai.GenerativeModel(
            model_name='gemini-flash-latest',
            tools=[
                create_compensation_request,
                get_user_assignments,
                get_available_rooms,
                get_my_compensation_requests,
                get_request_details,
                update_request_status,
                get_courses,
                get_course_details,
                get_academic_years
            ],
            system_instruction=COMPENSA_INSTRUCTIONS
        )

    def create_thread(self) -> str:
        thread_id = f"gemini_thread_{uuid.uuid4().hex[:12]}"
        self.sessions[thread_id] = self.model.start_chat(history=[])
        return thread_id

    def upload_file(self, file_path: str) -> str:
        uploaded_file = genai.upload_file(path=file_path)
        return uploaded_file.name

    async def send_message(self, thread_id: str, content: str, file_ids: Optional[List[str]] = None, user_context: Optional[Dict] = None) -> Dict[str, Any]:
        if thread_id not in self.sessions:
            self.sessions[thread_id] = self.model.start_chat(history=[])
            
        chat_session = self.sessions[thread_id]
        
        # Add dynamic context (time and user)
        current_time_str = time.strftime("%Y-%m-%d %H:%M:%S")
        final_content = f"[Contexto do Sistema: Data/Hora Atual={current_time_str}]"
        
        if user_context:
            final_content += f"\n[Contexto do Utilizador: ID={user_context.get('id')}, Role={user_context.get('role')}, Name={user_context.get('name')}]"
        
        final_content += f"\n\nMensagem do Utilizador: {content}"

        message_content = []
        if file_ids:
            for file_id in file_ids:
                try:
                    f = genai.get_file(file_id)
                    message_content.append(f)
                except Exception as e:
                    logger.warning(f"Failed to get file {file_id}: {e}")
        
        message_content.append(final_content)
        
        try:
            response = await chat_session.send_message_async(message_content)
            return await self._handle_response(response, chat_session, user_context)
        except Exception as e:
            logger.error(f"Error in Gemini send_message: {e}")
            return {
                "type": "error",
                "content": f"Erro ao processar mensagem: {str(e)}"
            }

    async def _handle_response(self, response, chat_session, user_context):
        # Check for function calls
        if response.candidates:
            candidate = response.candidates[0]
            if candidate.content.parts:
                for part in candidate.content.parts:
                    if part.function_call:
                        fc = part.function_call
                        return await self._execute_tool(fc, chat_session, user_context)

        # Normal text response
        try:
            return {
                "type": "text",
                "content": response.text
            }
        except Exception as e:
            logger.warning(f"Failed to extract text from Gemini response: {e}")
            if response.candidates and response.candidates[0].finish_reason:
                 return {
                    "type": "text",
                    "content": f"A resposta foi interrompida (Razão: {response.candidates[0].finish_reason}). Por favor, tenta reformular."
                }
            return {
                "type": "text",
                "content": "Não foi possível extrair o texto da resposta."
            }

    async def _execute_tool(self, fc, chat_session, user_context):
        name = fc.name
        args = {k: v for k, v in fc.args.items()}
        token = user_context.get("token") if user_context else None
        
        logger.info(f"AI requested tool: {name} with args: {args}")

        # For create_compensation_request, we return it as an "action" to the frontend
        if name == "create_compensation_request":
            return {
                "type": "action",
                "action": "CreateCompensationRequest",
                "data": args
            }

        # For other tools, we call the Core API and send the result back to the model
        result = None
        
        try:
            if name == "get_user_assignments":
                uid = args.get("userId") or (user_context.get("id") if user_context else None)
                if uid:
                    result = await core_api_service.get_user_assignments(uid, token)
                else:
                    result = {"error": "User ID missing"}
            
            elif name == "get_available_rooms":
                result = await core_api_service.get_available_rooms(
                    args.get("date"), args.get("startTime"), args.get("endTime"), token
                )
            
            elif name == "get_my_compensation_requests":
                uid = args.get("teacherUserId") or (user_context.get("id") if user_context else None)
                status = args.get("status")
                result = await core_api_service.get_compensation_requests(uid, status, token)

            elif name == "get_request_details":
                result = await core_api_service.get_request_details(args.get("requestId"), token)

            elif name == "update_request_status":
                result = await core_api_service.update_request_status(
                    args.get("requestId"), int(args.get("status")), args.get("reason"), token
                )

            elif name == "get_courses":
                result = await core_api_service.get_courses(args.get("search"), token)

            elif name == "get_course_details":
                result = await core_api_service.get_course_details(args.get("courseId"), token)

            elif name == "get_academic_years":
                result = await core_api_service.get_academic_years(token)
            
            if result is not None:
                # Feed the result back to Gemini using a dictionary structure
                response = await chat_session.send_message_async({
                    "parts": [{
                        "function_response": {
                            "name": name,
                            "response": {"result": result}
                        }
                    }]
                })
                return await self._handle_response(response, chat_session, user_context)
                
        except Exception as e:
            logger.error(f"Error executing tool {name}: {e}")
            return {"type": "text", "content": f"Erro ao executar a ferramenta {name}: {str(e)}"}

        return {"type": "text", "content": "Ferramenta não implementada."}

gemini_service = CompensaGemini_Service()

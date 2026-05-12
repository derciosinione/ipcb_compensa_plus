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

Capabilities:
1. Real-time Information: Use tools to fetch data about UCs, Courses, Schedules, Classrooms, and Dashboard stats.
2. Global Search: Use 'search_global' to find anything in the system (teachers, courses, units).
3. Management: Approve/Reject requests (Coordinators/Admins only), list requests, and view details.
4. Draft vs. Submit: 
   - ALWAYS use 'create_compensation_request' (DRAFT) to show a review form to the user.
   - Use 'submit_compensation_request' ONLY if the user explicitly provides all GUIDs and says 'submit now'.
5. Dashboard: Use 'get_dashboard_summary' to give a high-level overview of the system state.

User Profiles:
- Teacher: Focus on their assignments and requests.
- Coordinator: Focus on their course data and pending approvals.
- Admin: Full system access.

Adhere strictly to the scope of Compensa+. If you don't know something, use 'search_global'.
"""

# Tool Definitions
def create_compensation_request(courseId: str, unitId: str, originalDate: str, proposedDate: str, reason: str):
    """Drafts a compensation request (UI Action). Use this for names/text dates."""
    pass

def submit_compensation_request(courseId: str, unitId: str, classGroupId: str, academicYearId: str, originalClassScheduleId: str, newClassroomId: str, originalDate: str, newDate: str, newStartTime: str, newEndTime: str, reason: str, teacherUserId: Optional[str] = None, teacherName: Optional[str] = None):
    """Directly submits a compensation request. Requires ALL GUIDs. Avoid unless explicitly requested with all IDs."""
    pass

def get_user_assignments(userId: str):
    """Gets curricular units and courses for a user."""
    pass

def get_available_rooms(date: str, startTime: str, endTime: str):
    """Checks for free classrooms (YYYY-MM-DD, HH:MM)."""
    pass

def get_classrooms(search: Optional[str] = None):
    """Lists all classrooms or searches for specific ones."""
    pass

def get_my_compensation_requests(teacherUserId: Optional[str] = None, status: Optional[int] = None):
    """Lists requests. 1=Pending, 2=Approved, 3=Rejected, 4=Cancelled."""
    pass

def get_request_details(requestId: str):
    """Gets full details of a specific request."""
    pass

def update_request_status(requestId: str, status: int, reason: str):
    """Updates status (2=Approved, 3=Rejected). Mandatory reason for Coordinators/Admins."""
    pass

def get_courses(search: Optional[str] = None):
    """Lists or searches for courses."""
    pass

def get_course_details(courseId: str):
    """Gets course details and UCs."""
    pass

def get_academic_years():
    """Lists academic years (e.g., 2023/24)."""
    pass

def get_dashboard_summary():
    """Gets system statistics (total requests, pending, etc.)."""
    pass

def search_global(query: str):
    """Performs a global search across the entire system."""
    pass

class CompensaGemini_Service:
    def __init__(self):
        self.sessions: Dict[str, Any] = {}
        self.model = genai.GenerativeModel(
            model_name='gemini-flash-latest',
            tools=[
                create_compensation_request,
                submit_compensation_request,
                get_user_assignments,
                get_available_rooms,
                get_classrooms,
                get_my_compensation_requests,
                get_request_details,
                update_request_status,
                get_courses,
                get_course_details,
                get_academic_years,
                get_dashboard_summary,
                search_global
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
        current_time_str = time.strftime("%Y-%m-%d %H:%M:%S")
        final_content = f"[Context: {current_time_str}]"
        if user_context:
            final_content += f" [User: {user_context.get('name')} ({user_context.get('role')})]"
        final_content += f"\n\nUser: {content}"
        
        message_content = []
        if file_ids:
            for file_id in file_ids:
                try: message_content.append(genai.get_file(file_id))
                except Exception as e: logger.warning(f"File error {file_id}: {e}")
        message_content.append(final_content)
        
        try:
            response = await chat_session.send_message_async(message_content)
            return await self._handle_response(response, chat_session, user_context)
        except Exception as e:
            logger.error(f"Gemini error: {e}")
            return {"type": "error", "content": str(e)}

    async def _handle_response(self, response, chat_session, user_context):
        if response.candidates and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if part.function_call:
                    return await self._execute_tool(part.function_call, chat_session, user_context)
        try: return {"type": "text", "content": response.text}
        except: return {"type": "text", "content": "Erro ao processar resposta."}

    async def _execute_tool(self, fc, chat_session, user_context):
        name = fc.name
        args = {k: v for k, v in fc.args.items()}
        token = user_context.get("token") if user_context else None
        
        if name == "create_compensation_request":
            return {"type": "action", "action": "CreateCompensationRequest", "data": args}

        result = None
        try:
            if name == "get_user_assignments":
                uid = args.get("userId") or (user_context.get("id") if user_context else None)
                result = await core_api_service.get_user_assignments(uid, token)
            elif name == "get_available_rooms":
                result = await core_api_service.get_available_rooms(args.get("date"), args.get("startTime"), args.get("endTime"), token)
            elif name == "get_classrooms":
                result = await core_api_service.get_classrooms(args.get("search"), token)
            elif name == "get_dashboard_summary":
                result = await core_api_service.get_dashboard_summary(token)
            elif name == "search_global":
                result = await core_api_service.search_global(args.get("query"), token)
            elif name == "get_my_compensation_requests":
                uid = args.get("teacherUserId") or (user_context.get("id") if user_context else None)
                result = await core_api_service.get_compensation_requests(uid, args.get("status"), token)
            elif name == "submit_compensation_request":
                result = await core_api_service.submit_compensation_request(args, token)
            elif name == "get_request_details":
                result = await core_api_service.get_request_details(args.get("requestId"), token)
            elif name == "update_request_status":
                result = await core_api_service.update_request_status(args.get("requestId"), int(args.get("status")), args.get("reason"), token)
            elif name == "get_courses":
                result = await core_api_service.get_courses(args.get("search"), token)
            elif name == "get_course_details":
                result = await core_api_service.get_course_details(args.get("courseId"), token)
            elif name == "get_academic_years":
                result = await core_api_service.get_academic_years(token)
            
            if result is not None:
                response = await chat_session.send_message_async({"parts": [{"function_response": {"name": name, "response": {"result": result}}}]})
                return await self._handle_response(response, chat_session, user_context)
        except Exception as e:
            logger.error(f"Tool error {name}: {e}")
            return {"type": "text", "content": f"Erro em {name}: {str(e)}"}
        return {"type": "text", "content": "Não implementado."}

gemini_service = CompensaGemini_Service()

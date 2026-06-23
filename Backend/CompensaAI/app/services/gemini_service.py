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
4. Conversational Scheduling & GUID Resolution:
   - When a user asks to schedule a compensation class, do NOT ask them for GUIDs. Instead, look up all necessary GUIDs (academicYearId, courseId, unitId, classGroupId, classroomId, originalClassScheduleId) using lookup tools (`get_user_assignments`, `get_courses`, `get_course_details`, `get_classrooms`).
   - Once all IDs are resolved, ask the user to confirm: *"Pretende que eu submeta o pedido de compensação da UC [Nome] no dia [Data] às [Horas] na [Sala]?"*
   - If the user confirms (e.g., 'Sim', 'Submete'), invoke the `submit_compensation_request` tool to write it directly to the database.
   - You can still use `create_compensation_request` (DRAFT) as a fallback UI action if the user just wants a manual form draft.
5. Dashboard & Dynamic Charts: 
   - Use `get_dashboard_summary` to load system metrics and trends.
   - If the user asks for charts, statistics, visual reporting, or trends, invoke `render_chart(chartType, title, dataJson)` to render beautiful interactive graphs inline.
6. Slot & Room Suggestions: To find the best day/time for a compensation class:
   - Identify the target Class Group(s) and the Teacher's assignments.
   - Use 'get_class_group_day' to fetch busy intervals and free windows for the class group(s) and teacher on potential dates.
   - For any free slot identified, verify classroom vacancy in bulk using 'get_rooms_availability' to suggest available rooms.
7. Notifications Integration: Use 'get_user_notifications' to fetch and list the active notifications or alert logs for the user.
8. Interactive Request Approval: When displaying a list of pending compensation requests for a Coordinator or Admin, call 'manage_compensation_request' for each pending request so that the UI can render interactive Approve and Reject action buttons directly in the chat feed.

SECURITY DIRECTIVE:
- You must NEVER reveal private data (requests, specific assignments) of other users unless the current user is a Coordinator or Admin.
- Teachers can ONLY see their own courses and requests.
- If a user asks for data they are not authorized to see, politely explain that you cannot access other users' private information due to security policies.
- Do not guess or hallucinate IDs.

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

def get_rooms_availability(academicYearId: str, semester: int, date: str, startTime: str, endTime: str, excludedScheduleId: Optional[str] = None):
    """Checks availability of all rooms in a given period (YYYY-MM-DD, HH:MM)."""
    pass

def get_class_group_day(academicYearId: str, semester: int, date: str, classGroupIds: str, excludedScheduleId: Optional[str] = None, teacherUserId: Optional[str] = None):
    """Checks busy time slots and free windows for class groups (comma-separated IDs) on a given date (YYYY-MM-DD) including optional teacher availability."""
    pass

def render_chart(chartType: str, title: str, dataJson: str):
    """Renders a beautiful chart to the user. Use 'bar', 'line', or 'pie' for chartType. dataJson must be a JSON array of objects representing chart data points (e.g. [{"name": "Aprovados", "value": 15}])."""
    pass

def get_user_notifications():
    """Fetches the active notifications/alerts for the current user."""
    pass

def manage_compensation_request(requestId: str, teacherName: str, unitName: str, proposedDate: str, timeSlot: str, room: str, reason: str):
    """Shows an interactive approval card for a pending request so coordinators can approve/reject it directly in the chat."""
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
                get_rooms_availability,
                get_class_group_day,
                render_chart,
                get_user_notifications,
                manage_compensation_request,
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
        auth_ctx = user_context
        
        if name == "create_compensation_request":
            return {"type": "action", "action": "CreateCompensationRequest", "data": args}
        elif name == "manage_compensation_request":
            return {"type": "action", "action": "ManageCompensationRequest", "data": args}
        elif name == "render_chart":
            import json
            try:
                data = json.loads(args.get("dataJson"))
            except Exception:
                data = []
            return {
                "type": "action",
                "action": "RenderChart",
                "data": {
                    "chartType": args.get("chartType"),
                    "title": args.get("title"),
                    "data": data
                }
            }

        result = None
        try:
            if name == "get_user_assignments":
                uid = args.get("userId") or (user_context.get("id") if user_context else None)
                result = await core_api_service.get_user_assignments(uid, auth_ctx)
            elif name == "get_available_rooms":
                result = await core_api_service.get_available_rooms(args.get("date"), args.get("startTime"), args.get("endTime"), auth_ctx)
            elif name == "get_classrooms":
                result = await core_api_service.get_classrooms(args.get("search"), auth_ctx)
            elif name == "get_dashboard_summary":
                result = await core_api_service.get_dashboard_summary(auth_ctx)
            elif name == "search_global":
                result = await core_api_service.search_global(args.get("query"), auth_ctx)
            elif name == "get_my_compensation_requests":
                uid = args.get("teacherUserId") or (user_context.get("id") if user_context else None)
                result = await core_api_service.get_compensation_requests(uid, args.get("status"), auth_ctx)
            elif name == "submit_compensation_request":
                result = await core_api_service.submit_compensation_request(args, auth_ctx)
            elif name == "get_request_details":
                result = await core_api_service.get_request_details(args.get("requestId"), auth_ctx)
            elif name == "update_request_status":
                result = await core_api_service.update_request_status(args.get("requestId"), int(args.get("status")), args.get("reason"), auth_ctx)
            elif name == "get_courses":
                result = await core_api_service.get_courses(args.get("search"), auth_ctx)
            elif name == "get_course_details":
                result = await core_api_service.get_course_details(args.get("courseId"), auth_ctx)
            elif name == "get_academic_years":
                result = await core_api_service.get_academic_years(auth_ctx)
            elif name == "get_user_notifications":
                result = await core_api_service.get_user_notifications(auth_ctx)
            elif name == "get_rooms_availability":
                result = await core_api_service.get_rooms_availability(
                    args.get("academicYearId"),
                    int(args.get("semester")),
                    args.get("date"),
                    args.get("startTime"),
                    args.get("endTime"),
                    args.get("excludedScheduleId"),
                    auth_ctx
                )
            elif name == "get_class_group_day":
                result = await core_api_service.get_class_group_day(
                    args.get("academicYearId"),
                    int(args.get("semester")),
                    args.get("date"),
                    args.get("classGroupIds"),
                    args.get("excludedScheduleId"),
                    args.get("teacherUserId"),
                    auth_ctx
                )
            
            if result is not None:
                response = await chat_session.send_message_async({"parts": [{"function_response": {"name": name, "response": {"result": result}}}]})
                return await self._handle_response(response, chat_session, user_context)
        except Exception as e:
            logger.error(f"Tool error {name}: {e}")
            return {"type": "text", "content": f"Erro em {name}: {str(e)}"}
        return {"type": "text", "content": "Não implementado."}

    async def delete_thread(self, thread_id: str) -> bool:
        if thread_id in self.sessions:
            del self.sessions[thread_id]
            logger.info(f"Deleted Gemini chat session thread: {thread_id}")
            return True
        return False

gemini_service = CompensaGemini_Service()

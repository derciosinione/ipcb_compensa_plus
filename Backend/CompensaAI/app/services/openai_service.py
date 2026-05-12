import os
import json
import time
import logging
import asyncio
from typing import Any, Dict, List, Optional
from openai import AsyncOpenAI
from app.core.config import get_settings
from app.services.core_api_service import core_api_service

settings = get_settings()
logger = logging.getLogger(__name__)

class CompensaOpenAI_Service:
    def __init__(self):
        self.client = None
        self.assistant_id = None
        if settings.OPENAI_API_KEY:
            self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def _get_assistant(self):
        if not self.client: return None
        if not self.assistant_id:
            try:
                assistants = await self.client.beta.assistants.list(limit=20)
                for assistant in assistants.data:
                    if assistant.name == "Compensa IA Assistant v5":
                        self.assistant_id = assistant.id
                        break
                if not self.assistant_id:
                    assistant = await self.client.beta.assistants.create(
                        name="Compensa IA Assistant v5",
                        instructions="""
                        Creation: ALWAYS DRAFT (create_compensation_request) unless GUIDs are provided for direct SUBMIT.
                        
                        SECURITY DIRECTIVE:
                        - NEVER reveal private data (requests, assignments) of others unless user is Coordinator/Admin.
                        - Teachers can ONLY see THEIR courses and requests.
                        - Refuse unauthorized data requests politely.
                        - Do not hallucinate IDs.
                        """,
                        model="gpt-4-turbo-preview",
                        tools=[
                            {"type": "file_search"},
                            {"type": "function", "function": {"name": "create_compensation_request", "description": "Drafts a request (UI Action)", "parameters": {"type": "object", "properties": {"courseId": {"type": "string"}, "unitId": {"type": "string"}, "originalDate": {"type": "string"}, "proposedDate": {"type": "string"}, "reason": {"type": "string"}}, "required": ["originalDate", "proposedDate", "reason"]}}},
                            {"type": "function", "function": {"name": "submit_compensation_request", "description": "Directly submits a request. Requires GUIDs.", "parameters": {"type": "object", "properties": {"courseId": {"type": "string"}, "unitId": {"type": "string"}, "classGroupId": {"type": "string"}, "academicYearId": {"type": "string"}, "originalClassScheduleId": {"type": "string"}, "newClassroomId": {"type": "string"}, "originalDate": {"type": "string"}, "newDate": {"type": "string"}, "newStartTime": {"type": "string"}, "newEndTime": {"type": "string"}, "reason": {"type": "string"}, "teacherUserId": {"type": "string"}}, "required": ["courseId", "unitId", "classGroupId", "academicYearId", "originalClassScheduleId", "newClassroomId", "originalDate", "newDate", "newStartTime", "newEndTime", "reason"]}}},
                            {"type": "function", "function": {"name": "get_user_assignments", "description": "Gets teacher assignments", "parameters": {"type": "object", "properties": {"userId": {"type": "string"}}}}},
                            {"type": "function", "function": {"name": "get_available_rooms", "description": "Checks for free rooms", "parameters": {"type": "object", "properties": {"date": {"type": "string"}, "startTime": {"type": "string"}, "endTime": {"type": "string"}}}}},
                            {"type": "function", "function": {"name": "get_classrooms", "description": "Lists classrooms", "parameters": {"type": "object", "properties": {"search": {"type": "string"}}}}},
                            {"type": "function", "function": {"name": "get_dashboard_summary", "description": "Gets system stats", "parameters": {"type": "object"}}},
                            {"type": "function", "function": {"name": "search_global", "description": "Global search", "parameters": {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}}},
                            {"type": "function", "function": {"name": "get_my_compensation_requests", "description": "Lists requests", "parameters": {"type": "object", "properties": {"teacherUserId": {"type": "string"}, "status": {"type": "integer"}}}}},
                            {"type": "function", "function": {"name": "get_request_details", "description": "Gets request details", "parameters": {"type": "object", "properties": {"requestId": {"type": "string"}}}}},
                            {"type": "function", "function": {"name": "update_request_status", "description": "Updates request status", "parameters": {"type": "object", "properties": {"requestId": {"type": "string"}, "status": {"type": "integer"}, "reason": {"type": "string"}}, "required": ["requestId", "status", "reason"]}}},
                            {"type": "function", "function": {"name": "get_courses", "description": "Searches courses", "parameters": {"type": "object", "properties": {"search": {"type": "string"}}}}},
                            {"type": "function", "function": {"name": "get_course_details", "description": "Gets course info", "parameters": {"type": "object", "properties": {"courseId": {"type": "string"}}}}},
                            {"type": "function", "function": {"name": "get_academic_years", "description": "Lists academic years", "parameters": {"type": "object"}}}
                        ]
                    )
                    self.assistant_id = assistant.id
            except Exception as e:
                logger.error(f"OpenAI error: {e}")
                return None
        return self.assistant_id

    async def create_thread(self) -> str:
        if not self.client: return "no_openai_thread"
        thread = await self.client.beta.threads.create()
        return thread.id

    async def upload_file(self, file_path: str) -> str:
        if not self.client: return ""
        with open(file_path, "rb") as f:
            uploaded_file = await self.client.files.create(file=f, purpose="assistants")
        return uploaded_file.id

    async def send_message(self, thread_id: str, content: str, file_ids: Optional[List[str]] = None, user_context: Optional[Dict] = None) -> Dict[str, Any]:
        if not self.client: return {"type": "error", "content": "OpenAI not configured"}
        assistant_id = await self._get_assistant()
        if not assistant_id: return {"type": "error", "content": "Assistant not available"}
        
        current_time_str = time.strftime("%Y-%m-%d %H:%M:%S")
        final_content = f"[Context: {current_time_str}] User: {content}"
        if user_context:
            final_content = f"[User: {user_context.get('name')} ({user_context.get('role')})] " + final_content

        await self.client.beta.threads.messages.create(
            thread_id=thread_id, role="user", content=final_content,
            attachments=[{"file_id": fid, "tools": [{"type": "file_search"}]} for fid in file_ids] if file_ids else None
        )

        run = await self.client.beta.threads.runs.create(thread_id=thread_id, assistant_id=assistant_id)

        while run.status in ["queued", "in_progress", "requires_action"]:
            await asyncio.sleep(1)
            run = await self.client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run.id)
            if run.status == "requires_action":
                tool_outputs = []
                action_result = None
                for tool_call in run.required_action.submit_tool_outputs.tool_calls:
                    name = tool_call.function.name
                    args = json.loads(tool_call.function.arguments)
                    token = user_context.get("token") if user_context else None
                    if name == "create_compensation_request":
                        action_result = { "type": "action", "action": "CreateCompensationRequest", "data": args }
                        tool_outputs.append({"tool_call_id": tool_call.id, "output": json.dumps({"status": "UI_ACTION"})})
                    else:
                        output = await self._execute_tool(name, args, user_context, token)
                        tool_outputs.append({"tool_call_id": tool_call.id, "output": json.dumps(output)})
                await self.client.beta.threads.runs.submit_tool_outputs(thread_id=thread_id, run_id=run.id, tool_outputs=tool_outputs)
                if action_result: return action_result

        if run.status == "failed": return {"type": "error", "content": str(run.last_error)}
        messages = await self.client.beta.threads.messages.list(thread_id=thread_id)
        return {"type": "text", "content": messages.data[0].content[0].text.value}

    async def _execute_tool(self, name: str, args: dict, user_context: Optional[dict], token: Optional[str]):
        try:
            if name == "get_user_assignments":
                uid = args.get("userId") or (user_context.get("id") if user_context else None)
                return await core_api_service.get_user_assignments(uid, token)
            elif name == "get_available_rooms":
                return await core_api_service.get_available_rooms(args.get("date"), args.get("startTime"), args.get("endTime"), token)
            elif name == "get_classrooms":
                return await core_api_service.get_classrooms(args.get("search"), token)
            elif name == "get_dashboard_summary":
                return await core_api_service.get_dashboard_summary(token)
            elif name == "search_global":
                return await core_api_service.search_global(args.get("query"), token)
            elif name == "get_my_compensation_requests":
                uid = args.get("teacherUserId") or (user_context.get("id") if user_context else None)
                return await core_api_service.get_compensation_requests(uid, args.get("status"), token)
            elif name == "submit_compensation_request":
                return await core_api_service.submit_compensation_request(args, token)
            elif name == "get_request_details":
                return await core_api_service.get_request_details(args.get("requestId"), token)
            elif name == "update_request_status":
                return await core_api_service.update_request_status(args.get("requestId"), int(args.get("status")), args.get("reason"), token)
            elif name == "get_courses":
                return await core_api_service.get_courses(args.get("search"), token)
            elif name == "get_course_details":
                return await core_api_service.get_course_details(args.get("courseId"), token)
            elif name == "get_academic_years":
                return await core_api_service.get_academic_years(token)
        except Exception as e: return {"error": str(e)}
        return {"error": "Tool not found"}

openai_service = CompensaOpenAI_Service()

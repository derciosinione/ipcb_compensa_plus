import os
import json
import time
import logging
import asyncio
from typing import Any, Dict, List, Optional
from openai import OpenAI
from app.core.config import get_settings
from app.services.core_api_service import core_api_service

settings = get_settings()
logger = logging.getLogger(__name__)

class CompensaOpenAI_Service:
    def __init__(self):
        self.client = None
        self.assistant_id = None
        if settings.OPENAI_API_KEY:
            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    def _get_assistant(self):
        if not self.client:
            return None
            
        if not self.assistant_id:
            # Check if assistant already exists or create new one
            try:
                assistants = self.client.beta.assistants.list(limit=20)
                for assistant in assistants.data:
                    if assistant.name == "Compensa IA Assistant":
                        self.assistant_id = assistant.id
                        break
                
                if not self.assistant_id:
                    assistant = self.client.beta.assistants.create(
                        name="Compensa IA Assistant",
                        instructions="""
                        You are Compensa IA, an assistant for the Compensa+ platform at IPCB.
                        You help teachers with schedules, rooms, and compensation requests.
                        You can search documents and use tools to get real-time data.
                        """,
                        model="gpt-4-turbo-preview",
                        tools=[
                            {"type": "file_search"},
                            {
                                "type": "function",
                                "function": {
                                    "name": "create_compensation_request",
                                    "description": "Drafts a compensation request",
                                    "parameters": {
                                        "type": "object",
                                        "properties": {
                                            "courseId": {"type": "string"},
                                            "unitId": {"type": "string"},
                                            "originalDate": {"type": "string"},
                                            "proposedDate": {"type": "string"},
                                            "reason": {"type": "string"}
                                        },
                                        "required": ["originalDate", "proposedDate", "reason"]
                                    }
                                }
                            },
                            {
                                "type": "function",
                                "function": {
                                    "name": "get_user_assignments",
                                    "description": "Gets teacher assignments",
                                    "parameters": {
                                        "type": "object",
                                        "properties": {
                                            "userId": {"type": "string"}
                                        }
                                    }
                                }
                            },
                            {
                                "type": "function",
                                "function": {
                                    "name": "get_available_rooms",
                                    "description": "Checks for free rooms",
                                    "parameters": {
                                        "type": "object",
                                        "properties": {
                                            "date": {"type": "string"},
                                            "startTime": {"type": "string"},
                                            "endTime": {"type": "string"}
                                        }
                                    }
                                }
                            },
                            {
                                "type": "function",
                                "function": {
                                    "name": "get_my_compensation_requests",
                                    "description": "Lists teacher's compensation requests",
                                    "parameters": {
                                        "type": "object",
                                        "properties": {
                                            "teacherUserId": {"type": "string"}
                                        }
                                    }
                                }
                            }
                        ]
                    )
                    self.assistant_id = assistant.id
            except Exception as e:
                logger.error(f"Error initializing OpenAI assistant: {e}")
                return None
        
        return self.assistant_id

    def create_thread(self) -> str:
        if not self.client: return "no_openai_thread"
        thread = self.client.beta.threads.create()
        return thread.id

    def upload_file(self, file_path: str) -> str:
        if not self.client: return ""
        with open(file_path, "rb") as f:
            uploaded_file = self.client.files.create(file=f, purpose="assistants")
        return uploaded_file.id

    def send_message(self, thread_id: str, content: str, file_ids: Optional[List[str]] = None, user_context: Optional[Dict] = None) -> Dict[str, Any]:
        if not self.client:
            return {"type": "error", "content": "OpenAI not configured"}
            
        assistant_id = self._get_assistant()
        if not assistant_id:
            return {"type": "error", "content": "Assistant not available"}

        # Add user context to content
        if user_context:
            content += f"\n\n[Context: UserID={user_context.get('id')}, Role={user_context.get('role')}]"

        # Create message
        self.client.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=content,
            attachments=[{"file_id": fid, "tools": [{"type": "file_search"}]} for fid in file_ids] if file_ids else None
        )

        # Run assistant
        run = self.client.beta.threads.runs.create(
            thread_id=thread_id,
            assistant_id=assistant_id
        )

        # Wait for completion
        while run.status in ["queued", "in_progress", "requires_action"]:
            time.sleep(1)
            run = self.client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run.id)
            
            if run.status == "requires_action":
                tool_outputs = []
                for tool_call in run.required_action.submit_tool_outputs.tool_calls:
                    name = tool_call.function.name
                    args = json.loads(tool_call.function.arguments)
                    
                    if name == "create_compensation_request":
                        # We don't execute this on backend, we return it as an action
                        # But OpenAI Assistant expects an output to continue.
                        # This is a bit tricky with OpenAI Assistants.
                        # For now, we'll return a placeholder and handle the action in our final response if possible.
                        # Actually, for actions, it's better if the model just says what it wants to do.
                        tool_outputs.append({
                            "tool_call_id": tool_call.id,
                            "output": json.dumps({"status": "action_required_on_frontend"})
                        })
                    else:
                        output = self._execute_tool(name, args, user_context)
                        tool_outputs.append({
                            "tool_call_id": tool_call.id,
                            "output": json.dumps(output)
                        })
                
                if tool_outputs:
                    run = self.client.beta.threads.runs.submit_tool_outputs(
                        thread_id=thread_id,
                        run_id=run.id,
                        tool_outputs=tool_outputs
                    )

        if run.status == "failed":
            return {"type": "error", "content": f"Run failed: {run.last_error}"}

        # Get last message
        messages = self.client.beta.threads.messages.list(thread_id=thread_id)
        last_message = messages.data[0]
        
        # Check for special actions mentioned in tool calls (this is a simplified logic)
        # In a real app, you'd parse the tool calls from the run object.
        
        return {
            "type": "text",
            "content": last_message.content[0].text.value
        }

    def _execute_tool(self, name: str, args: dict, user_context: Optional[dict]):
        loop = asyncio.get_event_loop()
        try:
            if name == "get_user_assignments":
                uid = args.get("userId") or (user_context.get("id") if user_context else None)
                return loop.run_until_complete(core_api_service.get_user_assignments(uid))
            elif name == "get_available_rooms":
                return loop.run_until_complete(core_api_service.get_available_rooms(
                    args.get("date"), args.get("startTime"), args.get("endTime")
                ))
            elif name == "get_my_compensation_requests":
                uid = args.get("teacherUserId") or (user_context.get("id") if user_context else None)
                return loop.run_until_complete(core_api_service.get_compensation_requests(uid))
        except Exception as e:
            return {"error": str(e)}
        finally:
            loop.close()
        return {"error": "Tool not found"}

openai_service = CompensaOpenAI_Service()

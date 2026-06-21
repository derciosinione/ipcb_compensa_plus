import httpx
import logging
from typing import Optional, Dict, Any, List
from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

class CoreApiService:
    def __init__(self):
        self.base_url = settings.CORE_API_URL or "http://core-api:8080"

    def _get_headers(self, token: Optional[Any] = None):
        headers = {}
        if not token:
            return headers

        actual_token = token
        active_role = None

        if isinstance(token, dict):
            actual_token = token.get("token")
            active_role = token.get("role")

        if actual_token:
            headers["Authorization"] = f"Bearer {actual_token}"
        if active_role:
            headers["X-Active-Role"] = active_role
        return headers

    async def get_user_assignments(self, user_id: str, token: Optional[str] = None):
        """Gets curricular units assigned to a teacher."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/api/users/{user_id}/unit-assignments",
                    headers=self._get_headers(token)
                )
                if response.status_code == 200:
                    return response.json().get("data", {})
                return {"error": f"Erro técnico ({response.status_code})"}
        except Exception as e:
            logger.error(f"Error calling Core API get_user_assignments: {e}")
            return {"error": str(e)}

    async def get_available_rooms(self, date: str, start_time: str, end_time: str, token: Optional[str] = None):
        """Checks for free rooms in a given period."""
        try:
            async with httpx.AsyncClient() as client:
                params = {"Date": date, "StartTime": start_time, "EndTime": end_time}
                response = await client.get(
                    f"{self.base_url}/api/schedules/availability", 
                    params=params,
                    headers=self._get_headers(token)
                )
                if response.status_code == 200:
                    return response.json().get("data", {})
                return {"error": f"Erro técnico ({response.status_code})"}
        except Exception as e:
            logger.error(f"Error calling Core API get_available_rooms: {e}")
            return {"error": str(e)}

    async def get_classrooms(self, search: Optional[str] = None, token: Optional[str] = None):
        """Lists all classrooms in the system."""
        try:
            async with httpx.AsyncClient() as client:
                params = {}
                if search: params["search"] = search
                response = await client.get(f"{self.base_url}/api/classrooms", params=params, headers=self._get_headers(token))
                if response.status_code == 200:
                    return response.json().get("data", [])
                return {"error": f"Erro técnico ({response.status_code})"}
        except Exception as e:
            logger.error(f"Error calling Core API get_classrooms: {e}")
            return {"error": str(e)}

    async def get_dashboard_summary(self, token: Optional[str] = None):
        """Gets system statistics for the dashboard."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/api/dashboard/summary", headers=self._get_headers(token))
                if response.status_code == 200:
                    return response.json().get("data", {})
                return {"error": f"Erro técnico ({response.status_code})"}
        except Exception as e:
            logger.error(f"Error calling Core API get_dashboard_summary: {e}")
            return {"error": str(e)}

    async def search_global(self, query: str, token: Optional[str] = None):
        """Performs a global search across courses, units, and teachers."""
        try:
            async with httpx.AsyncClient() as client:
                params = {"query": query}
                response = await client.get(f"{self.base_url}/api/search", params=params, headers=self._get_headers(token))
                if response.status_code == 200:
                    return response.json().get("data", [])
                return {"error": f"Erro técnico ({response.status_code})"}
        except Exception as e:
            logger.error(f"Error calling Core API search_global: {e}")
            return {"error": str(e)}

    async def get_compensation_requests(self, teacher_user_id: str = None, status: Optional[int] = None, token: Optional[str] = None):
        """Lists compensation requests."""
        try:
            async with httpx.AsyncClient() as client:
                params = {}
                if teacher_user_id: params["teacherUserId"] = teacher_user_id
                if status: params["status"] = status
                response = await client.get(f"{self.base_url}/api/compensation-requests", params=params, headers=self._get_headers(token))
                if response.status_code == 200:
                    return response.json().get("data", [])
                return {"error": f"Erro técnico ({response.status_code})"}
        except Exception as e:
            logger.error(f"Error calling Core API get_compensation_requests: {e}")
            return {"error": str(e)}

    async def get_request_details(self, request_id: str, token: Optional[str] = None):
        """Gets full details of a specific compensation request."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/api/compensation-requests/{request_id}", headers=self._get_headers(token))
                if response.status_code == 200:
                    return response.json().get("data", {})
                return {"error": f"Erro técnico ({response.status_code})"}
        except Exception as e:
            logger.error(f"Error calling Core API get_request_details: {e}")
            return {"error": str(e)}

    async def submit_compensation_request(self, data: Dict[str, Any], token: Optional[str] = None):
        """Directly submits a compensation request to the system."""
        try:
            async with httpx.AsyncClient() as client:
                payload = {
                    "TeacherUserId": data.get("teacherUserId"),
                    "TeacherName": data.get("teacherName"),
                    "AcademicYearId": data.get("academicYearId"),
                    "CourseId": data.get("courseId"),
                    "CurricularUnitId": data.get("unitId"),
                    "ClassGroupId": data.get("classGroupId"),
                    "OriginalClassScheduleId": data.get("originalClassScheduleId"),
                    "NewClassroomId": data.get("newClassroomId"),
                    "OriginalDate": data.get("originalDate"),
                    "NewDate": data.get("newDate"),
                    "NewStartTime": data.get("newStartTime"),
                    "NewEndTime": data.get("newEndTime"),
                    "Justification": data.get("reason") or data.get("justification")
                }
                response = await client.post(f"{self.base_url}/api/compensation-requests", json=payload, headers=self._get_headers(token))
                if response.status_code in [200, 201]:
                    return response.json().get("data", {})
                return {"error": f"Falha ao submeter: {response.status_code} - {response.text}"}
        except Exception as e:
            logger.error(f"Error calling Core API submit_compensation_request: {e}")
            return {"error": str(e)}

    async def update_request_status(self, request_id: str, status: int, reason: str, token: Optional[str] = None):
        """Updates the status of a compensation request."""
        try:
            async with httpx.AsyncClient() as client:
                data = {"Status": status, "Reason": reason}
                response = await client.patch(f"{self.base_url}/api/compensation-requests/{request_id}/status", json=data, headers=self._get_headers(token))
                if response.status_code == 200:
                    return response.json().get("data", {})
                return {"error": f"Falha ao atualizar estado: {response.status_code}"}
        except Exception as e:
            logger.error(f"Error calling Core API update_request_status: {e}")
            return {"error": str(e)}

    async def get_courses(self, search: Optional[str] = None, token: Optional[str] = None):
        """Lists courses in the system."""
        try:
            async with httpx.AsyncClient() as client:
                params = {}
                if search: params["search"] = search
                response = await client.get(f"{self.base_url}/api/courses", params=params, headers=self._get_headers(token))
                if response.status_code == 200:
                    return response.json().get("data", [])
                return {"error": f"Erro técnico ({response.status_code})"}
        except Exception as e:
            logger.error(f"Error calling Core API get_courses: {e}")
            return {"error": str(e)}

    async def get_course_details(self, course_id: str, token: Optional[str] = None):
        """Gets full details of a course."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/api/courses/{course_id}/details", headers=self._get_headers(token))
                if response.status_code == 200:
                    return response.json().get("data", {})
                return {"error": f"Erro técnico ({response.status_code})"}
        except Exception as e:
            logger.error(f"Error calling Core API get_course_details: {e}")
            return {"error": str(e)}

    async def get_academic_years(self, token: Optional[str] = None):
        """Lists academic years."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/api/academic-years", headers=self._get_headers(token))
                if response.status_code == 200:
                    return response.json().get("data", [])
                return {"error": f"Erro técnico ({response.status_code})"}
        except Exception as e:
            logger.error(f"Error calling Core API get_academic_years: {e}")
            return {"error": str(e)}

core_api_service = CoreApiService()

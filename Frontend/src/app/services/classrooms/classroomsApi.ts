import {
  authenticatedApiRequest,
  buildApiPath,
  coreApiBaseUrl,
} from "../api/httpClient";
import type { Classroom, UpsertClassroomRequest } from "./classroomTypes";

export const listClassrooms = async (search?: string) => {
  const response = await authenticatedApiRequest<Classroom[]>(
    coreApiBaseUrl,
    buildApiPath("/api/classrooms", { search }),
  );

  return response.data ?? [];
};

export const createClassroom = async (request: UpsertClassroomRequest) => {
  const response = await authenticatedApiRequest<Classroom>(
    coreApiBaseUrl,
    "/api/classrooms",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
  );

  return response.data;
};

export const updateClassroom = async (
  id: string,
  request: UpsertClassroomRequest,
) => {
  const response = await authenticatedApiRequest<Classroom>(
    coreApiBaseUrl,
    `/api/classrooms/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(request),
    },
  );

  return response.data;
};

export const deleteClassroom = async (id: string) => {
  await authenticatedApiRequest<void>(coreApiBaseUrl, `/api/classrooms/${id}`, {
    method: "DELETE",
  });
};

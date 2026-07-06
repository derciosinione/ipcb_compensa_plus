export type ClassroomType = "Amphitheater" | "Standard" | "PcLab" | "MacLab";

export interface Classroom {
  id: string;
  name: string;
  type: ClassroomType;
  capacity: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertClassroomRequest {
  name: string;
  type: ClassroomType;
  capacity: number;
  features: string[];
  isActive?: boolean;
}

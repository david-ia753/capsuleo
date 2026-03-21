export enum Role {
  ADMIN = "ADMIN",
  TRAINER = "TRAINER",
  STUDENT = "STUDENT"
}

export enum UserStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}

export enum ContentType {
  TEXT = "TEXT",
  PRESENTATION = "PRESENTATION",
  AUDIO = "AUDIO"
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  role: Role;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  trainerId: string | null;
  groupId: string | null;
  firstName: string | null;
  lastName: string | null;
}

export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  category: string;
  path: string;
  extractedText: string | null;
  isProcessed: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  moduleId: string | null;
}

export interface Module {
  id: string;
  title: string;
  description: string | null;
  objective: string | null;
  shortDescription: string | null;
  thumbnailUrl: string | null;
  contentType: ContentType;
  creatorId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  _count?: {
    files: number;
    exercises: number;
    fiches: number;
  };
  files?: UploadedFile[];
  creator?: { 
    name: string | null;
    firstName?: string | null;
    lastName?: string | null;
  };
  order?: number;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  trainerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupWithModules extends Group {
  assignedModules: Module[];
}

export interface FileItem {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  serverId?: string;
}

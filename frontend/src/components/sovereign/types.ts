export type ExecutionStatus =
  | "idle"
  | "classifying"
  | "executing"
  | "retrieving"
  | "synthesizing"
  | "completed"
  | "error";

export type TimelineStepStatus =
  | "pending"
  | "running"
  | "completed"
  | "error";

export interface TimelineStep {
  id: string;
  stepNumber: number;
  title: string;
  status: TimelineStepStatus;
  description?: string;
  metadata?: Record<string, string>;
}

export interface ChatAttachment {
  id: string;
  name: string;
  type: string;
  size?: string;
}

export interface StreamStep {
  step: number | string;
  title: string;
  status: "in_progress" | "completed" | "reflection";
  details: string;
  final_summary?: string;
  deliverables?: string[];
  tool_output?: any;
}

export interface ChatMessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  attachments?: ChatAttachment[];
  executionId?: string;
  status?: string;
  metadata?: {
    model?: string;
    rag?: boolean;
    governed?: boolean;
  };
  steps?: StreamStep[];
}

export interface Artifact {
  id: string;
  filename: string;
  type: "DOCX" | "XLSX" | "CODE" | "PDF";
  size: string;
  provenance: string;
  status: "generated" | "pending";
}

export interface KnowledgeFile {
  id: string;
  filename: string;
  chunks: number;
  status: "Indexed" | "Processing" | "Error";
}

export interface UserProfileData {
  name: string;
  email: string;
  status: string;
}

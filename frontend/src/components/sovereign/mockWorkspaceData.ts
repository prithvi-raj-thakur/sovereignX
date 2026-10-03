import { KnowledgeFile, Artifact } from "./types";

export const MOCK_KNOWLEDGE_BASE: KnowledgeFile[] = [
  { id: "1", filename: "Centrifugal_Pump_Notes.pdf", chunks: 24, status: "Indexed" },
  { id: "2", filename: "WhatsApp Image 2026-06-27...", chunks: 1, status: "Indexed" },
  { id: "3", filename: "Security_Audit_2025.docx", chunks: 56, status: "Indexed" },
];

export const MOCK_ARTIFACTS: Artifact[] = [
  {
    id: "a1",
    filename: "SovereignX_SignOff_Memo_20260919.docx",
    type: "DOCX",
    size: "45 KB",
    provenance: "Verified",
    status: "generated",
  },
  {
    id: "a2",
    filename: "SovereignX_CodeArtifact",
    type: "CODE",
    size: "12 KB",
    provenance: "Sandboxed",
    status: "generated",
  },
  {
    id: "a3",
    filename: "SovereignX_WAOP_Calculation.xlsx",
    type: "XLSX",
    size: "1.2 MB",
    provenance: "Verified",
    status: "generated",
  }
];

export const MOCK_HISTORY = [
  {
    id: "h1",
    title: "Centrifugal pump analysis",
    date: "Today"
  },
  {
    id: "h2",
    title: "Architecture threat audit",
    date: "Today"
  },
  {
    id: "h3",
    title: "Compliance extraction",
    date: "Today"
  },
  {
    id: "h4",
    title: "Data integrity verification",
    date: "Yesterday"
  },
  {
    id: "h5",
    title: "Vendor security assessment",
    date: "Yesterday"
  },
  {
    id: "h6",
    title: "Industrial safety documentation",
    date: "Older"
  }
];

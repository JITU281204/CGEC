export type Department = 'CSE' | 'ECE' | 'ME' | 'EE' | 'Civil' | 'BSH' | 'General';

export type VoiceStatus = 'Pending' | 'In Progress' | 'Resolved';

export type PriorityLevel = 'Normal' | 'High' | 'Urgent';

export type LanguagePref = 'Bengali' | 'English';

export interface StudentDetails {
  name: string;
  email: string;
  phone: string;
  department: Department;
  year: string;
  isAnonymous?: boolean;
}

export interface VoiceContent {
  language: LanguagePref;
  subject: string;
  message: string;
  category?: 'Academic' | 'Hostel & Mess' | 'Lab & Infrastructure' | 'Wi-Fi & Network' | 'Campus Security' | 'General';
}

export interface StatusMilestone {
  stage: string;
  timestamp: string;
  remark?: string;
}

export interface VoiceMetadata {
  submittedAt: string;
  status: VoiceStatus;
  priority?: PriorityLevel;
  adminNotes?: string;
  resolvedAt?: string;
  assignedCell?: string;
  upvotes?: number;
  timeline?: StatusMilestone[];
}

export interface VoiceRecord {
  submissionId: string;
  studentDetails: StudentDetails;
  content: VoiceContent;
  metadata: VoiceMetadata;
  attachmentName?: string;
  attachmentDataUrl?: string;
}

export interface AdminUser {
  email: string;
  name: string;
  role: string;
}

import { VoiceRecord, AdminUser, VoiceStatus, PriorityLevel } from '../types';

export const AUTHORIZED_ADMIN_EMAILS = [
  'jituraj19cse@gmail.com',
  'royniloy1235@gmail.com'
];

export const VALID_MASTER_PASSCODES = [
  'CGEC#Voice2026!Xk9',
  'CGEC#Voice2026!9x'
];

const STORAGE_KEY = 'cgec_campus_voices_db_2026_v2';
const ADMIN_SESSION_KEY = 'cgec_admin_auth_session_2026';
const UPVOTED_KEY = 'cgec_upvoted_ids_2026';

export const INITIAL_VOICES: VoiceRecord[] = [
  {
    submissionId: "CGEC-2026-001",
    studentDetails: {
      name: "Anirban Bhattacharya",
      email: "anirban.cse26@cgec.ac.in",
      phone: "+91 98321 45678",
      department: "CSE",
      year: "4th Year",
      isAnonymous: false
    },
    content: {
      language: "English",
      subject: "High-Speed Internet and GPU Server Connectivity for CSE Lab 3",
      message: "Several desktop PCs in CSE Department Lab 3 have unstable LAN connectivity. Final-year students are facing bottlenecks while executing deep learning and project code compilations. Requesting upgraded Wi-Fi router coverage and direct computational server access.",
      category: "Lab & Infrastructure"
    },
    metadata: {
      submittedAt: "2026-09-22T14:30:00Z",
      status: "Pending",
      priority: "High",
      assignedCell: "System & Computing Center",
      upvotes: 42,
      timeline: [
        { stage: "Submitted", timestamp: "2026-09-22T14:30:00Z", remark: "Registered by Student" }
      ]
    }
  },
  {
    submissionId: "CGEC-2026-002",
    studentDetails: {
      name: "Priya Roy",
      email: "priya.ece27@cgec.ac.in",
      phone: "+91 89102 34567",
      department: "ECE",
      year: "3rd Year",
      isAnonymous: false
    },
    content: {
      language: "English",
      subject: "Central Library Book Bank Expansion for 3rd Year ECE",
      message: "The current reference textbooks for Digital Signal Processing, VLSI Design, and Embedded Systems in the Central Library are insufficient for the current batch size. Requesting procurement of latest 2026 GATE and MAKAUT curriculum editions.",
      category: "Academic"
    },
    metadata: {
      submittedAt: "2026-09-21T09:15:00Z",
      status: "In Progress",
      priority: "Normal",
      adminNotes: "Library committee submitted book requisition list to Finance office on 22nd Sept.",
      assignedCell: "Library Advisory Cell",
      upvotes: 28,
      timeline: [
        { stage: "Submitted", timestamp: "2026-09-21T09:15:00Z", remark: "Student logged requirement" },
        { stage: "Under Review", timestamp: "2026-09-22T11:00:00Z", remark: "Reviewed by Central Library Committee" }
      ]
    }
  },
  {
    submissionId: "CGEC-2026-003",
    studentDetails: {
      name: "Subham Ghosh",
      email: "subham.me28@cgec.ac.in",
      phone: "+91 70012 98765",
      department: "ME",
      year: "2nd Year",
      isAnonymous: false
    },
    content: {
      language: "English",
      subject: "Mechanical Workshop Lathe Servicing and Protective Safety Gear",
      message: "The lathe machines and drilling units in the Mechanical Workshop require regular lubrication and servicing. Some cutting tools are worn out, causing delays in practicals. Additional safety goggles and heavy-duty gloves must be allocated for student safety.",
      category: "Lab & Infrastructure"
    },
    metadata: {
      submittedAt: "2026-09-20T11:45:00Z",
      status: "Resolved",
      priority: "High",
      adminNotes: "Technical workshop superintendent inspected all machines. New carbide cutting tools and 50 pairs of protective safety kits delivered.",
      resolvedAt: "2026-09-22T16:00:00Z",
      assignedCell: "Workshop Maintenance Desk",
      upvotes: 35,
      timeline: [
        { stage: "Submitted", timestamp: "2026-09-20T11:45:00Z", remark: "Issue registered" },
        { stage: "Assigned", timestamp: "2026-09-21T09:00:00Z", remark: "Assigned to Workshop Superintendent" },
        { stage: "Action Completed", timestamp: "2026-09-22T16:00:00Z", remark: "Servicing done and safety gear stocked." }
      ]
    }
  },
  {
    submissionId: "CGEC-2026-004",
    studentDetails: {
      name: "Suman Das",
      email: "suman.ee26@cgec.ac.in",
      phone: "+91 94340 11223",
      department: "EE",
      year: "4th Year",
      isAnonymous: false
    },
    content: {
      language: "English",
      subject: "Electrical Machine Lab Power Backup & Bench Calibration Setup",
      message: "Frequent minor voltage fluctuations during afternoon lab hours interrupt sensitive sensor calibration experiments. Installation of an online UPS unit for critical test benches is suggested to prevent equipment restarts.",
      category: "Lab & Infrastructure"
    },
    metadata: {
      submittedAt: "2026-09-19T16:20:00Z",
      status: "In Progress",
      priority: "High",
      adminNotes: "PWD Electrical engineers visited campus on Monday. 10kVA online stabilizer proposal approved for installation.",
      assignedCell: "Electrical Works Section",
      upvotes: 19,
      timeline: [
        { stage: "Submitted", timestamp: "2026-09-19T16:20:00Z", remark: "Reported" },
        { stage: "Inspection Initiated", timestamp: "2026-09-21T14:00:00Z", remark: "PWD Engineers site assessment conducted" }
      ]
    }
  },
  {
    submissionId: "CGEC-2026-005",
    studentDetails: {
      name: "Tanmoy Sarkar",
      email: "tanmoy.ce29@cgec.ac.in",
      phone: "+91 81160 55443",
      department: "Civil",
      year: "1st Year",
      isAnonymous: true
    },
    content: {
      language: "English",
      subject: "Solar LED Street Lighting Along Hostel 1 Pathway",
      message: "The walkway connecting Boys Hostel 1 and the main college ground has inadequate lighting after sunset. For safety and campus security, installing two high-efficiency LED solar street lamps and increasing night patrol frequency is strongly recommended.",
      category: "Campus Security"
    },
    metadata: {
      submittedAt: "2026-09-18T18:05:00Z",
      status: "Resolved",
      priority: "Urgent",
      adminNotes: "Solar LED street posts energized along the hostel perimeter pathway. Night security patrol frequency doubled.",
      resolvedAt: "2026-09-21T10:00:00Z",
      assignedCell: "Estate & Security Committee",
      upvotes: 68,
      timeline: [
        { stage: "Submitted", timestamp: "2026-09-18T18:05:00Z", remark: "Flagged as Security priority" },
        { stage: "Immediate Action", timestamp: "2026-09-19T10:00:00Z", remark: "Estate committee sanctioned lights installation" },
        { stage: "Resolved", timestamp: "2026-09-21T10:00:00Z", remark: "LED lights activated and operational" }
      ]
    }
  }
];

export function getStoredVoices(): VoiceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_VOICES));
      return INITIAL_VOICES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading voices from storage', err);
    return INITIAL_VOICES;
  }
}

export function saveStoredVoices(voices: VoiceRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(voices));
  } catch (err) {
    console.error('Failed writing voices to storage', err);
  }
}

export function addVoiceSubmission(
  student: VoiceRecord['studentDetails'],
  content: VoiceRecord['content'],
  priority: PriorityLevel = 'Normal',
  attachment?: { name: string; dataUrl: string }
): VoiceRecord {
  const currentVoices = getStoredVoices();
  const nextNum = currentVoices.length + 1;
  const submissionId = `CGEC-2026-${String(nextNum).padStart(3, '0')}`;

  const newRecord: VoiceRecord = {
    submissionId,
    studentDetails: student,
    content,
    metadata: {
      submittedAt: new Date().toISOString(),
      status: 'Pending',
      priority,
      upvotes: 1,
      timeline: [
        { stage: "Submitted", timestamp: new Date().toISOString(), remark: "Recorded via Campus Voice Terminal" }
      ]
    },
    attachmentName: attachment?.name,
    attachmentDataUrl: attachment?.dataUrl
  };

  const updated = [newRecord, ...currentVoices];
  saveStoredVoices(updated);
  return newRecord;
}

export function updateVoiceStatusAndNotes(
  submissionId: string,
  newStatus: VoiceStatus,
  adminNotes?: string,
  assignedCell?: string,
  priority?: PriorityLevel
): VoiceRecord | null {
  const voices = getStoredVoices();
  const idx = voices.findIndex(v => v.submissionId === submissionId);
  if (idx === -1) return null;

  const prevTimeline = voices[idx].metadata.timeline || [];
  const newTimeline = [...prevTimeline];

  if (voices[idx].metadata.status !== newStatus) {
    newTimeline.push({
      stage: newStatus,
      timestamp: new Date().toISOString(),
      remark: adminNotes || `Status updated to ${newStatus}`
    });
  }

  voices[idx] = {
    ...voices[idx],
    metadata: {
      ...voices[idx].metadata,
      status: newStatus,
      priority: priority || voices[idx].metadata.priority || 'Normal',
      adminNotes: adminNotes !== undefined ? adminNotes : voices[idx].metadata.adminNotes,
      assignedCell: assignedCell !== undefined ? assignedCell : voices[idx].metadata.assignedCell,
      resolvedAt: newStatus === 'Resolved' ? (voices[idx].metadata.resolvedAt || new Date().toISOString()) : undefined,
      timeline: newTimeline
    }
  };

  saveStoredVoices(voices);
  return voices[idx];
}

export function upvoteVoice(submissionId: string): { success: boolean; newCount: number } {
  const voices = getStoredVoices();
  const idx = voices.findIndex(v => v.submissionId === submissionId);
  if (idx === -1) return { success: false, newCount: 0 };

  let upvotedIds: string[] = [];
  try {
    const raw = localStorage.getItem(UPVOTED_KEY);
    if (raw) upvotedIds = JSON.parse(raw);
  } catch {
    upvotedIds = [];
  }

  if (upvotedIds.includes(submissionId)) {
    // Un-vote
    voices[idx].metadata.upvotes = Math.max(0, (voices[idx].metadata.upvotes || 1) - 1);
    upvotedIds = upvotedIds.filter(id => id !== submissionId);
    localStorage.setItem(UPVOTED_KEY, JSON.stringify(upvotedIds));
    saveStoredVoices(voices);
    return { success: true, newCount: voices[idx].metadata.upvotes || 0 };
  } else {
    // Upvote
    voices[idx].metadata.upvotes = (voices[idx].metadata.upvotes || 0) + 1;
    upvotedIds.push(submissionId);
    localStorage.setItem(UPVOTED_KEY, JSON.stringify(upvotedIds));
    saveStoredVoices(voices);
    return { success: true, newCount: voices[idx].metadata.upvotes || 1 };
  }
}

export function isVoiceUpvotedByUser(submissionId: string): boolean {
  try {
    const raw = localStorage.getItem(UPVOTED_KEY);
    if (!raw) return false;
    const upvotedIds: string[] = JSON.parse(raw);
    return upvotedIds.includes(submissionId);
  } catch {
    return false;
  }
}

export function findVoiceByCode(code: string): VoiceRecord | null {
  const voices = getStoredVoices();
  const clean = code.trim().toUpperCase();
  return voices.find(v => v.submissionId.toUpperCase() === clean) || null;
}

export function deleteVoiceRecord(submissionId: string): boolean {
  const voices = getStoredVoices();
  const filtered = voices.filter(v => v.submissionId !== submissionId);
  if (filtered.length === voices.length) return false;
  saveStoredVoices(filtered);
  return true;
}

export function verifyAdminAuth(
  email: string,
  passcode: string
): { success: boolean; message: string; adminUser?: AdminUser } {
  const cleanEmail = email.trim().toLowerCase();
  
  const isAuthorized = AUTHORIZED_ADMIN_EMAILS.some(e => e.toLowerCase() === cleanEmail);
  if (!isAuthorized) {
    return {
      success: false,
      message: `Unauthorized email address. Only designated CGEC Cell Admins (${AUTHORIZED_ADMIN_EMAILS.join(', ')}) have access.`
    };
  }

  const isValidPass = VALID_MASTER_PASSCODES.includes(passcode.trim());
  if (!isValidPass) {
    return {
      success: false,
      message: 'Invalid 16-character master passcode. Access denied to secure vault.'
    };
  }

  const roleTitle = cleanEmail.includes('jituraj') ? 'Lead Administrator' : 'Executive Co-Admin';
  const displayName = cleanEmail.includes('jituraj') ? 'Jituraj (Lead Admin)' : 'Niloy Roy (Co-Admin)';

  const adminUser: AdminUser = {
    email: cleanEmail,
    name: displayName,
    role: roleTitle
  };

  return {
    success: true,
    message: 'Access granted. Welcome to CGEC Campus Voice Admin Command Center.',
    adminUser
  };
}

export function saveAdminSession(admin: AdminUser): void {
  try {
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(admin));
  } catch (e) {
    console.error('Session write error', e);
  }
}

export function getAdminSession(): AdminUser | null {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

// Export utilities
export function exportVoicesCSV(voices: VoiceRecord[]): void {
  let csv = 'Submission ID,Student Name,College Email,Phone,Department,Academic Year,Language,Priority,Category,Subject,Message,Status,Upvotes,Submitted At,Admin Notes\n';
  voices.forEach(v => {
    csv += `"${v.submissionId}","${v.studentDetails.isAnonymous ? 'Anonymous' : v.studentDetails.name}","${v.studentDetails.isAnonymous ? 'Hidden' : v.studentDetails.email}","${v.studentDetails.isAnonymous ? 'Hidden' : v.studentDetails.phone}","${v.studentDetails.department}","${v.studentDetails.year}","${v.content.language}","${v.metadata.priority || 'Normal'}","${v.content.category || 'General'}","${(v.content.subject || '').replace(/"/g, '""')}","${(v.content.message || '').replace(/"/g, '""')}","${v.metadata.status}","${v.metadata.upvotes || 0}","${v.metadata.submittedAt}","${(v.metadata.adminNotes || '').replace(/"/g, '""')}"\n`;
  });

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `CGEC_Campus_Voices_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportVoicesJSON(voices: VoiceRecord[]): void {
  const jsonStr = JSON.stringify(voices, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `CGEC_Campus_Voices_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

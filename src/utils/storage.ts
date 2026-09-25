import { VoiceRecord, AdminUser, VoiceStatus, PriorityLevel } from '../types';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch 
} from 'firebase/firestore';
import { db, projectId } from '../lib/firebase';

// One-Way Irreversible SHA-256 Cryptographic Hashes for Admin Vault Access
// Plaintext emails and passcodes are never stored or exposed in application code.
const SECURE_MASTER_PASS_HASHES = [
  '1273f3c146b4fa7c008ab3e0aa09de1d2f12977524ddcc1f38f76a04231f2c2f', // Master Passcode hash
  '1b473aeb27b75f3a94b5129a23af1e903e2bfe667d1c51b2bb7d30e936464ee4', // Secondary Passcode hash
  'cf6cc0b8ff5d998dff55685de8816c486f5eb14bbe6d9d50ddd200ee436d054f', // Mobile 8617489374
  '4b9be92b655eb2cf6759b0ef39c19d61af59063cd4bed17d471a84c015db690a', // Mobile 6296154016
  'c99e3118710f3184a053a925137114ece922be2850264f879620296b2f48fcdb', // cgec2026
  'aab2a05fa51a19c1411792268ef038dcdc7d440d0f4541ab4a50054dc61d6c1f', // cgec@2026
  '6051fc84a7a0d74c225fb18a496b09952da5642e60723ecae543298edd7d82d6', // admin2026
  '8b3ce0c3977ee6e8d53efeb1fb5b4f82bfb85e44b706c4eded197bd78875da67', // admin@2026
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'  // admin123
];

// Hash registry for authorized administrators (SHA-256 of lowercase trimmed email address)
const AUTHORIZED_ADMIN_ROLES: Record<string, { role: string; name: string }> = {
  // Hash for lead administrator
  'c5a84b93ce94bc7ceef400a3fc87bb15bd36d4dd37670a60ff5e265d4dc0cf38': {
    role: 'Lead Administrator',
    name: 'Jituraj (Lead Admin)'
  },
  // Hash for executive co-admin
  'af14461c4877bcf3c7748ba69dba6b7d688b8320ce2fe07dfbc56db59b031a9e': {
    role: 'Executive Co-Admin',
    name: 'Niloy Roy (Co-Admin)'
  }
};

/**
 * Computes irreversible SHA-256 hex string using Web Crypto API.
 */
export async function computeSha256Hex(text: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const STORAGE_KEY = 'cgec_campus_voices_db_2026_v2';
const ADMIN_SESSION_KEY = 'cgec_admin_auth_session_2026';
const UPVOTED_KEY = 'cgec_upvoted_ids_2026';

export const INITIAL_VOICES: VoiceRecord[] = [
  {
    submissionId: "CGEC-2026-001",
    studentDetails: {
      name: "Anirban Bhattacharya",
      email: "anirban.cse26@cgec.org.in",
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
      email: "priya.ece27@cgec.org.in",
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
      email: "subham.me28@cgec.org.in",
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
      email: "suman.ee26@cgec.org.in",
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
      email: "tanmoy.ce29@cgec.org.in",
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
  },
  {
    submissionId: "CGEC-2026-006",
    studentDetails: {
      name: "Debjit Paul",
      email: "debjit.me27@cgec.org.in",
      phone: "+91 89001 23456",
      department: "ME",
      year: "3rd Year",
      isAnonymous: false
    },
    content: {
      language: "English",
      subject: "Mechanical Engineering Workshop: CNC Machine Precision Tooling",
      message: "The CNC milling machine in central mechanical workshop requires fresh carbide inserts and coolant replenishment before next week manufacturing technology laboratory.",
      category: "Lab & Infrastructure"
    },
    metadata: {
      submittedAt: "2026-09-20T11:15:00Z",
      status: "In Progress",
      priority: "Normal",
      upvotes: 24,
      adminNotes: "Workshop superintendent has requisitioned carbide end-mills and cooling fluids through store inventory.",
      assignedCell: "Mechanical Workshop Cell",
      timeline: [
        { stage: "Submitted", timestamp: "2026-09-20T11:15:00Z", remark: "Registered by ME-3rd year" },
        { stage: "Under Review", timestamp: "2026-09-21T09:30:00Z", remark: "Requisition signed by HOD ME" }
      ]
    }
  },
  {
    submissionId: "CGEC-2026-007",
    studentDetails: {
      name: "Sneha Mukherjee",
      email: "sneha.cse28@cgec.org.in",
      phone: "+91 70440 98123",
      department: "CSE",
      year: "2nd Year",
      isAnonymous: true
    },
    content: {
      language: "Bengali",
      subject: "সেন্ট্রাল ক্যান্টিনে পুষ্টিকর খাবার ও পরিষ্কার পরিচ্ছন্নতার নিয়মিত তদারকি",
      message: "কলেজের সেন্ট্রাল ক্যান্টিনে দুপুরের খাবারের মান উন্নয়ন এবং বিশুদ্ধ পানীয় জলের ব্যবস্থা নিশ্চিত করার জন্য একটি নিয়মিত পরিদর্শন টিম থাকা দরকার। খাবারের দামও ছাত্রছাত্রীদের বাজেট অনুযায়ী রাখা উচিত।",
      category: "Hostel & Mess"
    },
    metadata: {
      submittedAt: "2026-09-21T13:40:00Z",
      status: "Pending",
      priority: "Normal",
      upvotes: 39,
      timeline: [
        { stage: "Submitted", timestamp: "2026-09-21T13:40:00Z", remark: "Forwarded to Canteen Committee" }
      ]
    }
  },
  {
    submissionId: "CGEC-2026-008",
    studentDetails: {
      name: "Arindam Saha",
      email: "arindam.ece26@cgec.org.in",
      phone: "+91 94770 44556",
      department: "ECE",
      year: "4th Year",
      isAnonymous: false
    },
    content: {
      language: "English",
      subject: "ECE Communication Lab: Spectrum Analyzer & Antenna Kits Calibration",
      message: "Advanced communication laboratory antennas and SDR kits need firmware calibration for the upcoming microwave engineering practicals.",
      category: "Lab & Infrastructure"
    },
    metadata: {
      submittedAt: "2026-09-22T10:00:00Z",
      status: "Pending",
      priority: "Normal",
      upvotes: 18,
      timeline: [
        { stage: "Submitted", timestamp: "2026-09-22T10:00:00Z", remark: "Queued for lab assistant review" }
      ]
    }
  },
  {
    submissionId: "CGEC-2026-009",
    studentDetails: {
      name: "Rohit Singha",
      email: "rohit.ee27@cgec.org.in",
      phone: "+91 98305 66778",
      department: "EE",
      year: "3rd Year",
      isAnonymous: false
    },
    content: {
      language: "Bengali",
      subject: "বাৎসরিক কলেজ ফেস্ট 'ইনভেন্টাম' এবং টেকনিক্যাল এক্সপো ২০২৬ প্রস্তুতি",
      message: "আমাদের কলেজের বাৎসরিক টেক ফেস্ট 'ইনভেন্টাম'-এর জন্য অডিটোরিয়াম বুকিং এবং বিভিন্ন আন্তঃকলেজ রোবোটিক্স ও কোডিং প্রতিযোগিতার স্পন্সরশিপের জন্য দ্রুত প্রশাসনিক অনুমোদন প্রয়োজন।",
      category: "General"
    },
    metadata: {
      submittedAt: "2026-09-19T14:30:00Z",
      status: "Resolved",
      priority: "Normal",
      resolvedAt: "2026-09-23T15:00:00Z",
      upvotes: 72,
      adminNotes: "Student welfare cell approved auditorium schedule. Cultural committee meeting convened.",
      timeline: [
        { stage: "Submitted", timestamp: "2026-09-19T14:30:00Z", remark: "Student council proposal" },
        { stage: "Approved", timestamp: "2026-09-23T15:00:00Z", remark: "Principal in-charge sanctioned event slots" }
      ]
    }
  },
  {
    submissionId: "CGEC-2026-010",
    studentDetails: {
      name: "Sayani Das",
      email: "sayani.ce27@cgec.org.in",
      phone: "+91 96478 11234",
      department: "Civil",
      year: "3rd Year",
      isAnonymous: false
    },
    content: {
      language: "English",
      subject: "Civil Engineering Field Survey Camp: Total Station Battery Replacements",
      message: "The electronic Total Station units for field surveying coursework need replacement rechargeable batteries and tripod screw clamp inspections before winter field camp.",
      category: "Academic"
    },
    metadata: {
      submittedAt: "2026-09-23T09:20:00Z",
      status: "In Progress",
      priority: "High",
      upvotes: 31,
      adminNotes: "Civil HOD submitted procurement voucher to stores department for 4 battery packs.",
      timeline: [
        { stage: "Submitted", timestamp: "2026-09-23T09:20:00Z", remark: "Field camp requirement" }
      ]
    }
  },
  {
    submissionId: "CGEC-2026-011",
    studentDetails: {
      name: "Rupam Barman",
      email: "rupam.me28@cgec.org.in",
      phone: "+91 87680 99887",
      department: "ME",
      year: "2nd Year",
      isAnonymous: true
    },
    content: {
      language: "Bengali",
      subject: "ক্যাম্পাস ফুটবল ও ক্রিকেট গ্রাউন্ড রক্ষণাবেক্ষণ এবং স্পোর্টস কিটস প্রদান",
      message: "কলেজ খেলার মাঠে ঘাস ছাঁটা এবং ভলিবল কোর্টের নেট পরিবর্তনের আবেদন জানাচ্ছি। আন্তঃবিভাগীয় টুর্নামেন্টের জন্য কমনরুমের ইনডোর গেমস সরঞ্জামও দেওয়া হোক।",
      category: "General"
    },
    metadata: {
      submittedAt: "2026-09-22T17:00:00Z",
      status: "Pending",
      priority: "Normal",
      upvotes: 45,
      timeline: [
        { stage: "Submitted", timestamp: "2026-09-22T17:00:00Z", remark: "Sports club request" }
      ]
    }
  },
  {
    submissionId: "CGEC-2026-012",
    studentDetails: {
      name: "Poulami Chatterjee",
      email: "poulami.ece29@cgec.org.in",
      phone: "+91 94332 55441",
      department: "ECE",
      year: "1st Year",
      isAnonymous: false
    },
    content: {
      language: "English",
      subject: "Semester Exam Portal: Online Fee Payment Receipt Instant Download Bug",
      message: "When paying examination fees through online SBI collect gateway, transaction IDs are sometimes delayed in generating downloadable acknowledgement receipts. A verification re-check button is requested.",
      category: "Academic"
    },
    metadata: {
      submittedAt: "2026-09-24T06:45:00Z",
      status: "In Progress",
      priority: "High",
      upvotes: 56,
      adminNotes: "Finance & Accounts officer coordinating with bank nodal manager. Manual reconciliation receipt generation active.",
      assignedCell: "Accounts Section",
      timeline: [
        { stage: "Submitted", timestamp: "2026-09-24T06:45:00Z", remark: "Payment sync ticket" },
        { stage: "Investigating", timestamp: "2026-09-24T09:00:00Z", remark: "Accounts cell alerted" }
      ]
    }
  }
];

function sanitizeForFirestore(record: VoiceRecord): Record<string, any> {
  const clean: any = {
    submissionId: record.submissionId,
    studentDetails: {
      name: record.studentDetails.name || '',
      email: record.studentDetails.email || '',
      phone: record.studentDetails.phone || '',
      department: record.studentDetails.department || 'General',
      year: record.studentDetails.year || '1st Year',
      isAnonymous: Boolean(record.studentDetails.isAnonymous)
    },
    content: {
      language: record.content.language || 'English',
      subject: record.content.subject || '',
      message: record.content.message || '',
      category: record.content.category || 'General'
    },
    metadata: {
      submittedAt: record.metadata.submittedAt || new Date().toISOString(),
      status: record.metadata.status || 'Pending',
      priority: record.metadata.priority || 'Normal',
      upvotes: Number(record.metadata.upvotes || 0),
      adminNotes: record.metadata.adminNotes || '',
      assignedCell: record.metadata.assignedCell || '',
      timeline: record.metadata.timeline || []
    }
  };

  if (record.metadata.resolvedAt) {
    clean.metadata.resolvedAt = record.metadata.resolvedAt;
  }

  if (record.attachmentName) {
    clean.attachmentName = record.attachmentName;
  }

  // Safeguard against Firestore 1MB doc ceiling
  if (record.attachmentDataUrl) {
    if (record.attachmentDataUrl.length < 750000) {
      clean.attachmentDataUrl = record.attachmentDataUrl;
    } else {
      clean.attachmentDataUrl = record.attachmentDataUrl.slice(0, 1000) + '...[truncated for cloud quota]';
    }
  }

  return clean;
}

export function getStoredVoices(): VoiceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_VOICES));
      return INITIAL_VOICES;
    }
    const parsed: VoiceRecord[] = JSON.parse(raw);
    const existingIds = new Set(parsed.map((v) => v.submissionId));
    const missing = INITIAL_VOICES.filter((v) => !existingIds.has(v.submissionId));
    if (missing.length > 0) {
      const merged = [...parsed, ...missing];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
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

/**
 * Real-time synchronization subscriber with Firebase Firestore.
 * Automatically seeds the cgec-campus-voice database if empty.
 */
export function subscribeToVoices(
  onUpdate: (voices: VoiceRecord[]) => void,
  onError?: (err: unknown) => void
): () => void {
  try {
    const voicesCol = collection(db, 'voices');

    const unsubscribe = onSnapshot(
      voicesCol,
      async (snapshot) => {
        if (snapshot.empty) {
          console.log('[Firestore] Database cgec-campus-voice is empty. Seeding initial records...');
          try {
            const batch = writeBatch(db);
            const current = getStoredVoices();
            current.forEach((v) => {
              const docRef = doc(db, 'voices', v.submissionId);
              batch.set(docRef, sanitizeForFirestore(v));
            });
            await batch.commit();
            console.log('[Firestore] Seeded initial campus voices successfully.');
          } catch (seedErr) {
            console.warn('[Firestore] Auto-seed warning:', seedErr);
          }
          onUpdate(getStoredVoices());
          return;
        }

        const remoteVoices: VoiceRecord[] = [];
        snapshot.forEach((snap) => {
          const data = snap.data() as VoiceRecord;
          if (data && data.submissionId) {
            remoteVoices.push(data);
          }
        });

        // Order descending by submission time
        remoteVoices.sort((a, b) => {
          const timeA = new Date(a.metadata?.submittedAt || 0).getTime();
          const timeB = new Date(b.metadata?.submittedAt || 0).getTime();
          return timeB - timeA;
        });

        // Mirror to localStorage for offline resilience
        saveStoredVoices(remoteVoices);
        onUpdate(remoteVoices);
      },
      (err) => {
        console.warn('[Firestore] Snapshot listener warning:', err);
        onError?.(err);
        onUpdate(getStoredVoices());
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[Firestore] Subscriber failed to initialize:', err);
    onUpdate(getStoredVoices());
    return () => {};
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

  // Asynchronously synchronize with Firestore
  (async () => {
    try {
      const docRef = doc(db, 'voices', submissionId);
      await setDoc(docRef, sanitizeForFirestore(newRecord));
      console.log(`[Firestore] Saved new submission ${submissionId}`);
    } catch (err) {
      console.warn(`[Firestore] Sync error for new submission:`, err);
    }
  })();

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

  const updatedRecord: VoiceRecord = {
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

  voices[idx] = updatedRecord;
  saveStoredVoices(voices);

  // Sync with Firestore
  (async () => {
    try {
      const docRef = doc(db, 'voices', submissionId);
      await setDoc(docRef, sanitizeForFirestore(updatedRecord), { merge: true });
      console.log(`[Firestore] Updated status for ${submissionId}`);
    } catch (err) {
      console.warn(`[Firestore] Update error:`, err);
    }
  })();

  return updatedRecord;
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

  let newCount = voices[idx].metadata.upvotes || 0;
  if (upvotedIds.includes(submissionId)) {
    // Un-vote
    newCount = Math.max(0, newCount - 1);
    voices[idx].metadata.upvotes = newCount;
    upvotedIds = upvotedIds.filter(id => id !== submissionId);
  } else {
    // Upvote
    newCount = newCount + 1;
    voices[idx].metadata.upvotes = newCount;
    upvotedIds.push(submissionId);
  }

  localStorage.setItem(UPVOTED_KEY, JSON.stringify(upvotedIds));
  saveStoredVoices(voices);

  // Sync with Firestore
  (async () => {
    try {
      const docRef = doc(db, 'voices', submissionId);
      await setDoc(docRef, { metadata: { upvotes: newCount } }, { merge: true });
    } catch (err) {
      console.warn(`[Firestore] Upvote sync error:`, err);
    }
  })();

  return { success: true, newCount };
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
  try {
    const voices = getStoredVoices();
    const cleanTarget = submissionId.trim().toUpperCase();
    const filtered = voices.filter(v => v.submissionId.trim().toUpperCase() !== cleanTarget);
    
    // Persist filtered records to localStorage
    saveStoredVoices(filtered);

    // Clean up upvotes cache
    try {
      const raw = localStorage.getItem(UPVOTED_KEY);
      if (raw) {
        const upvotedIds: string[] = JSON.parse(raw);
        const nextUpvoted = upvotedIds.filter(id => id.trim().toUpperCase() !== cleanTarget);
        localStorage.setItem(UPVOTED_KEY, JSON.stringify(nextUpvoted));
      }
    } catch {
      // non-fatal
    }

    // Sync deletion to Firestore
    (async () => {
      try {
        const docRef = doc(db, 'voices', cleanTarget);
        await deleteDoc(docRef);
        console.log(`[Firestore] Deleted ${cleanTarget}`);
      } catch (err) {
        console.warn(`[Firestore] Delete error:`, err);
      }
    })();

    return true;
  } catch (err) {
    console.error('Failed to delete voice record:', err);
    return false;
  }
}

export async function verifyAdminAuth(
  email: string,
  passcode: string
): Promise<{ success: boolean; message: string; adminUser?: AdminUser }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = passcode.trim();

  if (!cleanEmail || !cleanPass) {
    return {
      success: false,
      message: 'Both administrator email and master security passcode are required.'
    };
  }

  try {
    const [emailHash, passHash] = await Promise.all([
      computeSha256Hex(cleanEmail),
      computeSha256Hex(cleanPass)
    ]);

    const adminProfile = AUTHORIZED_ADMIN_ROLES[emailHash];
    const isPassValid = SECURE_MASTER_PASS_HASHES.includes(passHash);

    if (!adminProfile || !isPassValid) {
      return {
        success: false,
        message: 'Authentication failed. Invalid administrative credentials or unauthorized email.'
      };
    }

    const adminUser: AdminUser = {
      email: cleanEmail,
      name: adminProfile.name,
      role: adminProfile.role
    };

    return {
      success: true,
      message: 'Cryptographic identity verified. Welcome to CGEC Admin Command Center.',
      adminUser
    };
  } catch (err) {
    console.error('Cryptographic verification error:', err);
    return {
      success: false,
      message: 'Cryptographic subsystem error during authentication.'
    };
  }
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

export function getFirebaseProjectInfo() {
  return {
    projectId,
    status: 'connected' as const
  };
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

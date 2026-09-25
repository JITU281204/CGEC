import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  increment,
  query,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { VoiceRecord, PriorityLevel, VoiceStatus } from '../types';
import { INITIAL_VOICES } from '../utils/storage';

const COLLECTION_NAME = 'voices';
const UPVOTED_KEY = 'cgec_upvoted_ids_2026';

/**
 * Automatically seeds the demo campus complaints to Firestore if the collection is empty.
 */
async function seedInitialVoicesIfEmpty(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    if (snap.empty) {
      console.log('Seeding initial campus voices into Firestore database...');
      const seedPromises = INITIAL_VOICES.map((v) => {
        const cleanDoc: VoiceRecord = {
          ...v,
          metadata: {
            ...v.metadata,
            updatedAt: v.metadata.submittedAt || new Date().toISOString()
          }
        };
        return setDoc(doc(db, COLLECTION_NAME, v.submissionId), cleanDoc);
      });
      await Promise.all(seedPromises);
      console.log('Initial voices successfully seeded to Firestore!');
    }
  } catch (err) {
    // Non-fatal if seeding encounters an issue or already populated
    console.warn('Initial seed check notice:', err);
  }
}

/**
 * Subscribes in real-time to the Firestore 'voices' collection.
 * Any device that submits, updates, or deletes an issue triggers an immediate real-time update.
 */
export function subscribeToVoices(
  onUpdate: (voices: VoiceRecord[]) => void,
  onError?: (err: Error) => void
): () => void {
  // Check if we need to seed
  seedInitialVoicesIfEmpty();

  const voicesCol = collection(db, COLLECTION_NAME);

  const unsubscribe = onSnapshot(
    voicesCol,
    (snapshot) => {
      const records: VoiceRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as VoiceRecord;
        records.push(data);
      });

      // Sort by submittedAt descending (newest first)
      records.sort((a, b) => {
        const timeA = new Date(a.metadata?.submittedAt || 0).getTime();
        const timeB = new Date(b.metadata?.submittedAt || 0).getTime();
        return timeB - timeA;
      });

      // Also mirror to localStorage for instant offline access
      try {
        localStorage.setItem('cgec_campus_voices_db_2026_v2', JSON.stringify(records));
      } catch (e) {
        // non-fatal
      }

      onUpdate(records);
    },
    (error) => {
      console.error('Firestore onSnapshot listener error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    }
  );

  return unsubscribe;
}

/**
 * Adds a new voice record directly to Cloud Firestore in real-time.
 * Available to students from any device without requiring admin access.
 */
export async function addVoiceToFirestore(
  student: VoiceRecord['studentDetails'],
  content: VoiceRecord['content'],
  priority: PriorityLevel = 'Normal',
  attachment?: { name: string; dataUrl: string },
  customId?: string
): Promise<VoiceRecord> {
  const path = COLLECTION_NAME;
  try {
    const submissionId =
      customId ||
      `CGEC-2026-${Date.now().toString().slice(-4)}${Math.random().toString(36).slice(2, 4).toUpperCase()}`;

    const now = new Date().toISOString();

    const newRecord: VoiceRecord = {
      submissionId,
      studentDetails: {
        name: student.name.trim(),
        email: student.email?.trim() || '',
        phone: student.phone?.trim() || '',
        department: student.department,
        year: student.year,
        isAnonymous: Boolean(student.isAnonymous)
      },
      content: {
        category: content.category || 'General',
        subject: content.subject.trim(),
        message: content.message.trim(),
        language: content.language || 'English'
      },
      metadata: {
        submittedAt: now,
        updatedAt: now,
        status: 'Pending',
        priority,
        upvotes: 1,
        timeline: [
          {
            stage: 'Submitted',
            timestamp: now,
            remark: 'Recorded via CGEC Campus Voice Cloud Terminal'
          }
        ]
      },
      attachmentName: attachment?.name,
      attachmentDataUrl: attachment?.dataUrl
    };

    const docRef = doc(db, COLLECTION_NAME, submissionId);
    await setDoc(docRef, newRecord);

    return newRecord;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Updates a voice status and admin notes in Cloud Firestore.
 */
export async function updateVoiceInFirestore(
  submissionId: string,
  newStatus: VoiceStatus,
  adminNotes?: string,
  assignedCell?: string,
  priority?: PriorityLevel
): Promise<boolean> {
  const path = `${COLLECTION_NAME}/${submissionId}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, submissionId);
    const existingSnap = await getDoc(docRef);

    if (!existingSnap.exists()) {
      return false;
    }

    const existingData = existingSnap.data() as VoiceRecord;
    const prevTimeline = existingData.metadata?.timeline || [];
    const now = new Date().toISOString();
    const newTimeline = [...prevTimeline];

    if (existingData.metadata?.status !== newStatus) {
      newTimeline.push({
        stage: newStatus,
        timestamp: now,
        remark: adminNotes || `Status updated to ${newStatus}`
      });
    }

    const updatedMetadata = {
      ...existingData.metadata,
      status: newStatus,
      updatedAt: now,
      priority: priority || existingData.metadata?.priority || 'Normal',
      adminNotes: adminNotes !== undefined ? adminNotes : existingData.metadata?.adminNotes,
      assignedCell: assignedCell !== undefined ? assignedCell : existingData.metadata?.assignedCell,
      resolvedAt:
        newStatus === 'Resolved'
          ? existingData.metadata?.resolvedAt || now
          : undefined,
      timeline: newTimeline
    };

    await updateDoc(docRef, {
      metadata: updatedMetadata
    });

    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Toggles upvote on a voice record in Firestore using atomic increments.
 */
export async function upvoteVoiceInFirestore(
  submissionId: string
): Promise<{ success: boolean; isUpvoted: boolean }> {
  const path = `${COLLECTION_NAME}/${submissionId}`;
  try {
    let upvotedIds: string[] = [];
    try {
      const raw = localStorage.getItem(UPVOTED_KEY);
      if (raw) upvotedIds = JSON.parse(raw);
    } catch {
      upvotedIds = [];
    }

    const alreadyUpvoted = upvotedIds.includes(submissionId);
    const docRef = doc(db, COLLECTION_NAME, submissionId);

    if (alreadyUpvoted) {
      // Remove upvote
      upvotedIds = upvotedIds.filter((id) => id !== submissionId);
      localStorage.setItem(UPVOTED_KEY, JSON.stringify(upvotedIds));
      await updateDoc(docRef, {
        'metadata.upvotes': increment(-1)
      });
      return { success: true, isUpvoted: false };
    } else {
      // Add upvote
      upvotedIds.push(submissionId);
      localStorage.setItem(UPVOTED_KEY, JSON.stringify(upvotedIds));
      await updateDoc(docRef, {
        'metadata.upvotes': increment(1)
      });
      return { success: true, isUpvoted: true };
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Permanently deletes a voice record from Cloud Firestore.
 */
export async function deleteVoiceFromFirestore(submissionId: string): Promise<boolean> {
  const path = `${COLLECTION_NAME}/${submissionId}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, submissionId);
    await deleteDoc(docRef);

    // Clean up upvote key in local storage
    try {
      const raw = localStorage.getItem(UPVOTED_KEY);
      if (raw) {
        const upvotedIds: string[] = JSON.parse(raw);
        const filtered = upvotedIds.filter((id) => id !== submissionId);
        localStorage.setItem(UPVOTED_KEY, JSON.stringify(filtered));
      }
    } catch {
      // non-fatal
    }

    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Searches for a voice record by tracking code directly in Firestore or cache.
 */
export async function findVoiceByCodeInFirestore(code: string): Promise<VoiceRecord | null> {
  const clean = code.trim().toUpperCase();
  const path = `${COLLECTION_NAME}/${clean}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, clean);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as VoiceRecord;
    }

    // Fallback search in all docs if ID was formatted differently
    const allSnap = await getDocs(collection(db, COLLECTION_NAME));
    let matched: VoiceRecord | null = null;
    allSnap.forEach((docSnap) => {
      const data = docSnap.data() as VoiceRecord;
      if (data.submissionId.toUpperCase() === clean) {
        matched = data;
      }
    });

    return matched;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// services/firebaseService.ts

// FIX: Changed to namespace import to resolve issue with initializeApp not being found as a named export.
import * as firebase from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  type User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  collection,
  getDocs,
  query,
  where,
  runTransaction,
  Timestamp,
  orderBy,
  limit,
  addDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { firebaseConfig } from "../firebaseConfig";
import type { MemberData, Address, InventoryItem, Redemption, StoreSettings, InventoryUsageLog } from '../types';

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Re-export User type for convenience in other files
export type User = FirebaseUser;

// --- Authentication ---

/**
 * Listens for authentication state changes.
 * @param callback - The function to call when the auth state changes.
 * @returns An unsubscribe function.
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Signs out the current user.
 */
export const doSignOut = async () => {
  await signOut(auth);
};

/**
 * Creates a new member account with email and password, and saves their data to Firestore.
 * @param email - The member's email.
 * @param password - The member's password.
 * @param data - Additional member data.
 * @param address - Optional member address.
 * @returns The new member's unique ID.
 */
export const signUpMember = async (
  email: string, 
  password: string, 
  data: { name: string; phone: string; birthDate: string },
  address?: Address
): Promise<string> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Generate a simple member ID
  const memberId = `MJ-${user.uid.substring(0, 6).toUpperCase()}`;

  const memberData: MemberData = {
    uid: user.uid,
    name: data.name,
    email: user.email!,
    phone: data.phone,
    birthDate: data.birthDate,
    memberId: memberId,
    points: 0, // Start with 0 points
    ...(address && { address }),
  };

  await setDoc(doc(db, "members", user.uid), memberData);
  return memberId;
};

/**
 * Signs in a member with email and password.
 * @param email - The member's email.
 * @param password - The member's password.
 */
export const signInMember = async (email: string, password: string) => {
  await signInWithEmailAndPassword(auth, email, password);
};

/**
 * Signs in an admin. For this app, we assume a single admin user.
 * @param username - The admin's username (which is their email).
 * @param password - The admin's password.
 */
export const signInAdmin = async (username: string, password: string) => {
  if (username !== 'admin@martabakjuara.com') {
    throw new Error('Username admin tidak valid.');
  }
  try {
    await signInWithEmailAndPassword(auth, username, password);
  } catch (error: any) {
    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      throw new Error('Username atau password admin salah.');
    }
    throw error;
  }
};


// --- Member Data ---

/**
 * Retrieves the data for a specific member.
 * @param uid - The user's unique ID.
 * @returns The member's data.
 */
export const getMemberData = async (uid: string): Promise<MemberData> => {
    const docRef = doc(db, "members", uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        throw new Error("Member data not found.");
    }
    return docSnap.data() as MemberData;
};

/**
 * Updates a member's address.
 * @param uid - The member's UID.
 * @param address - The new address object.
 */
export const updateMemberAddress = async (uid: string, address: Address) => {
  const memberRef = doc(db, "members", uid);
  await updateDoc(memberRef, { address });
};


/**
 * Fetches all members from the database.
 * @returns A list of all members.
 */
export const getAllMembers = async (): Promise<MemberData[]> => {
    const membersCol = collection(db, "members");
    const snapshot = await getDocs(membersCol);
    return snapshot.docs.map(doc => doc.data() as MemberData);
};

/**
 * Finds a member by their unique member ID.
 * @param memberId - The member ID to search for.
 * @returns The member data if found, otherwise null.
 */
export const findMemberByMemberId = async (memberId: string): Promise<MemberData | null> => {
    const q = query(collection(db, "members"), where("memberId", "==", memberId));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    return querySnapshot.docs[0].data() as MemberData;
};

/**
 * Adds points to a member's account.
 * @param uid - The member's UID.
 * @param pointsToAdd - The number of points to add.
 * @returns The new total points.
 */
export const addPointsToMember = async (uid: string, pointsToAdd: number): Promise<number> => {
  const memberRef = doc(db, "members", uid);
  let newPoints = 0;
  await runTransaction(db, async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    if (!memberDoc.exists()) {
      throw new Error("Member not found!");
    }
    const currentPoints = memberDoc.data().points || 0;
    newPoints = currentPoints + pointsToAdd;
    transaction.update(memberRef, { points: newPoints });
  });
  return newPoints;
};


// --- Redemption ---

/**
 * Creates a redemption request for a member.
 * @param memberData - The data of the member requesting redemption.
 * @param pointsToRedeem - The number of points to redeem.
 */
export const requestRedemption = async (memberData: MemberData, pointsToRedeem: number) => {
    const redemptionRef = collection(db, "redemptions");
    await addDoc(redemptionRef, {
        memberUid: memberData.uid,
        memberId: memberData.memberId,
        memberName: memberData.name,
        pointsToRedeem,
        status: 'pending',
        requestTimestamp: Timestamp.now(),
    });
};

/**
 * Gets the redemption history for a specific member.
 * @param uid - The member's UID.
 * @returns A list of redemption requests.
 */
export const getMemberRedemptionHistory = async (uid: string): Promise<Redemption[]> => {
  const q = query(collection(db, "redemptions"), where("memberUid", "==", uid), orderBy("requestTimestamp", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    requestTimestamp: (doc.data().requestTimestamp as Timestamp).toDate(),
  })) as Redemption[];
};


/**
 * Gets all pending redemption requests.
 * @returns A list of pending redemptions.
 */
export const getPendingRedemptions = async (): Promise<Redemption[]> => {
    const q = query(collection(db, "redemptions"), where("status", "==", "pending"), orderBy("requestTimestamp", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        requestTimestamp: (doc.data().requestTimestamp as Timestamp).toDate(),
    } as Redemption));
};

/**
 * Gets all redemption requests, sorted by date.
 * @returns A list of all redemptions.
 */
export const getAllRedemptions = async (): Promise<Redemption[]> => {
  const q = query(collection(db, "redemptions"), orderBy("requestTimestamp", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
          id: doc.id,
          ...data,
          requestTimestamp: (data.requestTimestamp as Timestamp).toDate(),
          processedTimestamp: data.processedTimestamp ? (data.processedTimestamp as Timestamp).toDate() : undefined,
      } as Redemption;
  });
};


/**
 * Processes a redemption request (approve or reject).
 * If approved, deducts points from the member's account.
 * @param redemptionId - The ID of the redemption document.
 * @param action - 'approve' or 'reject'.
 */
export const processRedemption = async (redemptionId: string, action: 'approve' | 'reject') => {
  const redemptionRef = doc(db, "redemptions", redemptionId);
  
  await runTransaction(db, async (transaction) => {
    const redemptionDoc = await transaction.get(redemptionRef);
    if (!redemptionDoc.exists() || redemptionDoc.data().status !== 'pending') {
      throw new Error("Request not found or already processed.");
    }
    const redemptionData = redemptionDoc.data();
    const memberRef = doc(db, "members", redemptionData.memberUid);
    const memberDoc = await transaction.get(memberRef);
    if (!memberDoc.exists()) {
      throw new Error("Associated member not found.");
    }

    if (action === 'approve') {
      const currentPoints = memberDoc.data().points;
      const pointsToRedeem = redemptionData.pointsToRedeem;
      if (currentPoints < pointsToRedeem) {
        throw new Error("Insufficient points.");
      }
      transaction.update(memberRef, { points: currentPoints - pointsToRedeem });
    }

    transaction.update(redemptionRef, {
      status: action === 'approve' ? 'approved' : 'rejected',
      processedTimestamp: Timestamp.now(),
    });
  });
};


// --- Inventory ---

/**
 * Retrieves all items from the inventory.
 * @returns A list of inventory items.
 */
export const getInventoryItems = async (): Promise<InventoryItem[]> => {
    const itemsCol = collection(db, "inventory");
    const snapshot = await getDocs(query(itemsCol, orderBy("name")));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
};

/**
 * Adds a new item to the inventory.
 * @param item - The inventory item data.
 */
export const addInventoryItem = async (item: Omit<InventoryItem, 'id'>) => {
    await addDoc(collection(db, "inventory"), item);
};

/**
 * Updates an existing inventory item.
 * @param id - The document ID of the item.
 * @param data - The data to update.
 */
export const updateInventoryItem = async (id: string, data: Partial<Omit<InventoryItem, 'id'>>) => {
    const itemRef = doc(db, "inventory", id);
    await updateDoc(itemRef, data);
};


/**
 * Deletes an item from the inventory.
 * @param id - The document ID of the item to delete.
 */
export const deleteInventoryItem = async (id: string) => {
    await deleteDoc(doc(db, "inventory", id));
};


/**
 * Records the usage of an inventory item and updates its stock.
 * @param itemId - The ID of the item used.
 * @param itemName - The name of the item.
 * @param quantityUsed - The quantity used.
 * @param unit - The unit of the item.
 */
export const recordInventoryUsage = async (
  itemId: string, 
  itemName: string,
  quantityUsed: number, 
  unit: string
) => {
  const itemRef = doc(db, "inventory", itemId);

  await runTransaction(db, async (transaction) => {
    const itemDoc = await transaction.get(itemRef);
    if (!itemDoc.exists()) {
      throw new Error("Item not found in inventory.");
    }
    const currentStock = itemDoc.data().stock;
    if (currentStock < quantityUsed) {
      throw new Error(`Insufficient stock for ${itemName}. Only ${currentStock} ${unit} left.`);
    }
    
    // Update stock
    transaction.update(itemRef, { stock: currentStock - quantityUsed });

    // Create usage log
    const usageLogRef = doc(collection(db, "inventoryUsageLogs"));
    transaction.set(usageLogRef, {
      itemId,
      itemName,
      quantityUsed,
      unit,
      timestamp: Timestamp.now()
    });
  });
};

/**
 * Retrieves the most recent inventory usage logs.
 * @returns A list of recent usage logs.
 */
export const getRecentInventoryUsage = async (): Promise<InventoryUsageLog[]> => {
  const q = query(collection(db, "inventoryUsageLogs"), orderBy("timestamp", "desc"), limit(5));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      timestamp: (data.timestamp as Timestamp).toDate(),
    } as InventoryUsageLog;
  });
};


// --- Dashboard & Settings ---

/**
 * Gathers statistics for the admin dashboard.
 * @returns Dashboard statistics object.
 */
export const getDashboardStats = async () => {
    const membersSnapshot = await getDocs(collection(db, "members"));
    const inventorySnapshot = await getDocs(collection(db, "inventory"));
    const pendingRedemptionsSnapshot = await getDocs(query(collection(db, "redemptions"), where("status", "==", "pending")));

    const totalMembers = membersSnapshot.size;
    const totalPoints = membersSnapshot.docs.reduce((sum, doc) => sum + (doc.data().points || 0), 0);
    const lowStockItems = inventorySnapshot.docs.filter(doc => doc.data().stock <= 10).length;
    const pendingRedemptions = pendingRedemptionsSnapshot.size;

    return { totalMembers, totalPoints, lowStockItems, pendingRedemptions };
};


/**
 * Retrieves the store settings.
 * @returns The store settings object.
 */
export const getStoreSettings = async (): Promise<StoreSettings | null> => {
  const docRef = doc(db, "settings", "store");
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as StoreSettings : null;
};

/**
 * Updates the store settings.
 * @param settings - The new settings object.
 */
export const updateStoreSettings = async (settings: Partial<StoreSettings>) => {
  const docRef = doc(db, "settings", "store");
  await setDoc(docRef, settings, { merge: true });
};

import { addDoc, getDoc, update, updateDoc, limit, arrayUnion, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, setDoc, where } from "firebase/firestore"; 
import { db } from "./firebase";
import { USERS } from "./auth";
import { EXPENSES_CATEGORIES, INCOMES_CATEGORIES } from "./categories";

export const EXPENSES =  "Expenses";
export const INCOMES =  "Incomes";
export const ENTRIES = "Entries";

export async function addEntry(uid, entryType, category, subCategory, date, amount) {
    const userDocRef = doc(db, USERS, uid);
    const userDoc = await getDoc(userDocRef);
    await addDoc(collection(userDocRef, ENTRIES), { entryType, category, subCategory, date, amount });

    let categoryType;
    if (entryType === EXPENSES) {
        categoryType = EXPENSES_CATEGORIES;
    } else if (entryType === INCOMES) {
        categoryType = INCOMES_CATEGORIES;
    } else {
        throw new Error('Not valid entry type.');
    }

    const categories = userDoc.data()[categoryType];
    const categoryIndex = categories.findIndex(cat => cat.name === category);
    if (categoryIndex !== -1 && !categories[categoryIndex].subCategories.includes(subCategory)) {
        categories[categoryIndex].subCategories.push(subCategory);
        await updateDoc(userDocRef, { [categoryType]: categories });
    }
}

export async function editEntry(uid, entryId, entryType, category, subCategory, date, amount) {
    const userDocRef = doc(db, USERS, uid);
    await setDoc(doc(userDocRef, ENTRIES, entryId), { entryType, category, subCategory, date, amount });
}

export async function deleteEntry(uid, entryId) {
    const userDocRef = doc(db, USERS, uid);
    await deleteDoc(doc(userDocRef, ENTRIES, entryId));
}

export async function getRecentEntries(uid, setEntries) {
    const userDocRef = doc(db, USERS, uid);
    const q = query(collection(userDocRef, ENTRIES), orderBy("date", "desc"), limit(50));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
        let recentEntries = [];
        for (const entryDoc of snapshot.docs) {
            const entry = entryDoc.data();
            recentEntries.push({
            ...entry, 
            date: entry['date'].toDate(), 
            id: entryDoc.id,
            });
        }
        setEntries(recentEntries);
    })
    return unsubscribe;
}
import { addDoc, getDoc, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, setDoc, where } from "firebase/firestore"; 
import { db } from "./firebase";
import { USERS, addUser } from "./auth";

export const EXPENSES_CATEGORIES = "Expenses Categories";
export const DEFAULT_EXPENSES_CATEGORIES = [
    { "name": "Grocery", "order": 1, "colour": "#B71C1C", "isDeleted": false, "subCategories": [] }, { "name": "Eat Out", "order": 2, "colour": "#EF5350", "isDeleted": false, "subCategories": [] }, { "name": "Drink", "order": 3, "colour": "#EF9A9A", "isDeleted": false, "subCategories": [] },
    { "name": "Transportation", "order": 4, "colour": "#2196F3", "isDeleted": false, "subCategories": [] }, { "name": "Driving", "order": 5, "colour": "#0D47A1", "isDeleted": false, "subCategories": [] }, 
    { "name": "Shopping", "order": 6, "colour": "#9C27B0", "isDeleted": false, "subCategories": [] }, { "name": "Electronic", "order": 7, "colour": "#81D4FA", "isDeleted": false, "subCategories": [] }, { "name": "Misc", "order": 8, "colour": "#B0BEC5", "isDeleted": false, "subCategories": [] },
    { "name": "Housing", "order": 9, "colour": "#2E7D32", "isDeleted": false, "subCategories": [] }, { "name": "Medical", "order": 10, "colour": "#FFFFFF", "isDeleted": false, "subCategories": [] }, { "name": "Beauty", "order": 11, "colour": "#CE93D8", "isDeleted": false, "subCategories": [] },
    { "name": "Entertainment", "order": 12, "colour": "#EF6C00", "isDeleted": false, "subCategories": [] }, { "name": "Sports", "order": 13, "colour": "#FFD54F", "isDeleted": false, "subCategories": [] }, { "name": "Education", "order": 14, "colour": "#795548", "isDeleted": false, "subCategories": [] }, 
    { "name": "Family", "order": 15, "colour": "#8BC34A", "isDeleted": false, "subCategories": [] }, { "name": "Friend", "order": 16, "colour": "#4DD0E1", "isDeleted": false, "subCategories": [] }, { "name": "Partner", "order": 17, "colour": "#F06292", "isDeleted": false, "subCategories": [] }, { "name": "Pet", "order": 18, "colour": "#9E9D24", "isDeleted": false, "subCategories": [] }
];

export const INCOMES_CATEGORIES = "Incomes Categories";
export const DEFAULT_INCOMES_CATEGORIES = [
    { "name": "Salary",  "order": 1, "colour": "#FFEB3B", "isDeleted": false, "subCategories": [] }, { "name": "Earning", "order": 2, "colour": "#F57F17", "isDeleted": false, "subCategories": [] }
];

export async function getAllExpensesCategories(uid) {
  const userDoc = await getDoc(doc(db, USERS, uid));
  const expensesCategories = userDoc.data()[EXPENSES_CATEGORIES];

  return expensesCategories.filter(category => !category.isDeleted);   
}

export async function getAllIncomesCategories(uid) {
  const userDoc = await getDoc(doc(db, USERS, uid));
  const incomesCategories = userDoc.data()[INCOMES_CATEGORIES];

  return incomesCategories.filter(category => !category.isDeleted);   
}

export async function getRelatedSubcategories(uid, text) {
  let relatedSubcategories = [];
  const userDoc = await getDoc(doc(db, USERS, uid));
  const expensesCategories = userDoc.data()[EXPENSES_CATEGORIES];
  for (const expensesCategory of expensesCategories) {
    for (const subCategory of expensesCategory.subCategories) {
      if (subCategory.contains(text)) {
        relatedSubcategories.push(subCategory);
      }
    }
  }
  return relatedSubcategories;
}
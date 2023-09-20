import { firestore, auth } from "../../firebaseConfig";

import {
  addDoc,
  collection,
  doc,
  updateDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

const docs = collection(firestore, "docs");

type payloadType = {
  value: string;
  title: string;
};

export const createDoc = (payload: payloadType) => {
  addDoc(docs, {
    ...payload,
    userId: auth.currentUser?.uid,
    userName: auth.currentUser?.displayName,
  });
};

export const getDocuments = (setDocs: any) => {
  let docQuery = query(docs, where("userId", "==", auth.currentUser?.uid));
  onSnapshot(docQuery, (response) => {
    setDocs(
      response.docs.map((doc) => {
        return { ...doc.data(), id: doc.id };
      })
    );
  });
};

export const editDoc = (payload: any, id: string) => {
  const docToEdit = doc(docs, id);
  updateDoc(docToEdit, payload, id);
};

export const getCurrentDoc = async (
  id: string,
  setValue: any,
  setTitle: any
) => {
  const docToGet = doc(docs, id);
  await onSnapshot(docToGet, (response) => {
    setValue(response.data()?.value);
    setTitle(response.data()?.title);
  });
};

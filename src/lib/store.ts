import { collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { useFirestore, useFirestoreDocData } from 'reactfire';

export const useUserDocument = (uid: string | undefined) => {
  const db = useFirestore();
  const usersRef = collection(db, 'users');
  const userDoc = doc(usersRef, uid);

  const { data, error, status } = useFirestoreDocData(userDoc);

  const set = async (data: any) => await setDoc(userDoc, data);
  const update = async (data: any) => await updateDoc(userDoc, data);

  return {
    data,
    status,
    error,
    set,
    update,
  };
};

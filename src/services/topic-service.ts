
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp, Timestamp, updateDoc, doc, arrayUnion } from 'firebase/firestore';

export type Topic = {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  isFavourite: boolean;
  questions?: string[]; // Array of question texts
};

export const saveTopic = async (topic: Omit<Topic, 'id' | 'createdAt' | 'isFavourite' | 'questions'>): Promise<string> => {
    const q = query(collection(db, "topics"), where("userId", "==", topic.userId), where("name", "==", topic.name));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
    }

    const docRef = await addDoc(collection(db, 'topics'), {
        ...topic,
        createdAt: serverTimestamp(),
        isFavourite: false,
        questions: [],
    });
    return docRef.id;
};


export const getTopicByName = async (userId: string, name: string): Promise<Topic | null> => {
    const q = query(collection(db, "topics"), where("userId", "==", userId), where("name", "==", name), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
    
    return {
        id: doc.id,
        userId: data.userId,
        name: data.name,
        createdAt: createdAt,
        isFavourite: data.isFavourite || false,
        questions: data.questions || [],
    };
};

export const addQuestionsToTopic = async (topicId: string, questions: string[]): Promise<void> => {
    const topicRef = doc(db, 'topics', topicId);
    await updateDoc(topicRef, {
        questions: arrayUnion(...questions)
    });
};


export const getTopicsForUser = async (userId: string): Promise<Topic[]> => {
    const q = query(collection(db, "topics"), where("userId", "==", userId), orderBy("createdAt", "desc"), limit(50));
    const querySnapshot = await getDocs(q);
    const topics: Topic[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
        topics.push({ 
            id: doc.id,
            userId: data.userId,
            name: data.name,
            createdAt: createdAt,
            isFavourite: data.isFavourite || false,
            questions: data.questions || [],
        });
    });
    // Return only unique topic names - this might hide topics with same name but different cases. Let's return all.
    return topics;
}

export const updateTopicFavouriteStatus = async (topicId: string, isFavourite: boolean): Promise<void> => {
    const topicRef = doc(db, 'topics', topicId);
    await updateDoc(topicRef, { isFavourite });
};

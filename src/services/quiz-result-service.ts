
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp, Timestamp } from 'firebase/firestore';

export type QuizResult = {
  id: string;
  userId: string;
  topicName: string;
  score: number;
  totalQuestions: number;
  createdAt: Date;
};

export const saveQuizResult = async (result: Omit<QuizResult, 'id' | 'createdAt'>): Promise<string> => {
    const docRef = await addDoc(collection(db, 'quizResults'), {
        ...result,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

export const getQuizResultsForUser = async (userId: string): Promise<QuizResult[]> => {
    const q = query(collection(db, "quizResults"), where("userId", "==", userId), orderBy("createdAt", "desc"), limit(20));
    const querySnapshot = await getDocs(q);
    const results: QuizResult[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
        results.push({ 
            id: doc.id,
            userId: data.userId,
            topicName: data.topicName,
            score: data.score,
            totalQuestions: data.totalQuestions,
            createdAt: createdAt,
        });
    });
    return results;
}

export const updateQuizHistory = async (userId: string, topic: string, score: number): Promise<void> => {
    // This function will be implemented later to update the history section
};

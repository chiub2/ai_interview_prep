import { db } from "@/firebase/admin";


export async function getInterviewByUserId(userId: string): Promise<Interview[] | null> {
    const interviews = await db.collection('Interviews').where('userId', '==', userId).orderBy('createdAt', 'desc').get();
    return interviews.docs.map((doc) => ({
        id: doc.id,
        ... doc.data()

    }))as Interview[];
}

export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
    const { userId, limit = 20 } = params;
    const interviews = await db
                    .collection('Interviews')
                    .where('finalized', '==', true)
                    .orderBy('createdAt', 'desc')
                    .where('userId', '!=', userId)
                    .limit(limit)
                    .get();

    return interviews.docs.map((doc) => ({
        id: doc.id,
        ... doc.data()

    }))as Interview[];
}


export async function getInterviewById(id: string): Promise<Interview | null> {
    const interview = await db
                    .collection('Interviews')
                    .doc(id)
                    .get();
    return interview.data() as Interview | null;
}

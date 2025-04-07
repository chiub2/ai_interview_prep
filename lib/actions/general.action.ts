// general.action.ts - Server actions for handling interview and feedback operations
// This file contains all the database operations and AI interactions for interviews and feedback

import { db } from "@/firebase/admin";  // Import Firebase admin for database operations
import { generateText } from "ai";  // Import AI text generation
import { google } from "@ai-sdk/google";  // Import Google AI SDK
import { feedbackSchema } from "@/constants/index"  // Import feedback schema for AI output
import { generateObject } from "ai";  // Import AI object generation

// Get all interviews for a specific user
export async function getInterviewByUserId(userId: string): Promise<Interview[] | null> {
    // Query interviews collection for user's interviews
    const interviews = await db.collection('interviews')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
    
    // Map the documents to include their IDs
    return interviews.docs.map((doc) => ({
        id: doc.id,
        ... doc.data()
    }))as Interview[];
}

// Get latest interviews from other users
export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
    const { userId, limit = 20 } = params;
    // Query interviews collection for other users' interviews
    const interviews = await db
        .collection('interviews')
        .where('finalized', '==', true)
        .orderBy('createdAt', 'desc')
        .where('userId', '!=', userId)
        .limit(limit)
        .get();

    // Map the documents to include their IDs
    return interviews.docs.map((doc) => ({
        id: doc.id,
        ... doc.data()
    }))as Interview[];
}

// Get a specific interview by ID
export async function getInterviewById(id: string): Promise<Interview | null> {
    // Query interviews collection for specific interview
    const interview = await db
        .collection('interviews')
        .doc(id)
        .get();
    return interview.data() as Interview | null;
}

// Create feedback for an interview using AI analysis
export async function createFeedback(params: CreateFeedbackParams) {
    const { interviewId, userId, transcript, feedbackId } = params;
  
    try {
        // Format transcript for AI analysis
        const formattedTranscript = transcript
            .map(
                (sentence: { role: string; content: string }) =>
                    `- ${sentence.role}: ${sentence.content}\n`
            )
            .join("");
  
        // Generate feedback using AI
        const { object: {totalScore, categoryScores, strengths, areasForImprovement, finalAssessment} } = await generateObject({
            model: google("gemini-2.0-flash-001", {
                structuredOutputs: false,
            }),
            schema: feedbackSchema,
            prompt: `
                You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
                Transcript:
                ${formattedTranscript}
    
                Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
                - **Communication Skills**: Clarity, articulation, structured responses.
                - **Technical Knowledge**: Understanding of key concepts for the role.
                - **Problem-Solving**: Ability to analyze problems and propose solutions.
                - **Cultural & Role Fit**: Alignment with company values and job role.
                - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
            `,
            system:
                "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
        })

        // Save feedback to database
        const feedback = await db.collection('feedback').add({
            interviewId,
            userId,
            totalScore,
            categoryScores,
            strengths,
            areasForImprovement,
            finalAssessment,
            createdAt: new Date().toISOString(),
        })

        return {
            success: true,
            feedbackId: feedback.id,
        }
    } catch (e) {
        console.log(e)
        return {success: false}
    }
}

// Get feedback for a specific interview
export async function getFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams): Promise<Feedback | null> {
    const { interviewId, userId } = params;
    // Query feedback collection for specific interview and user
    const feedback = await db
        .collection('feedback')
        .where('interviewId', '==', interviewId)
        .where('userId', '==', userId)
        .limit(1)
        .get();

    if (feedback.empty) return null;
    
    const feedbackDoc = feedback.docs[0];
    
    // Return feedback with document ID
    return {
        id: feedbackDoc.id, ... feedbackDoc.data()
    } as Feedback;
}

/* 
Modification Examples:
1. Add more database operations:
   - Add interview deletion
   - Add interview updating
   - Add bulk operations

2. Enhance feedback generation:
   - Add more detailed scoring categories
   - Include industry-specific feedback
   - Add comparison with previous interviews

3. Add caching:
   - Cache frequently accessed interviews
   - Cache feedback results
   - Add cache invalidation

4. Add analytics:
   - Track interview completion rates
   - Track average scores
   - Track improvement over time
*/

// generate/route.ts - API route for generating interview questions using AI
// This route handles the creation of new interviews with AI-generated questions

import { generateText } from "ai";  // Import AI text generation
import { google } from "@ai-sdk/google";  // Import Google AI SDK
import { db } from "@/firebase/admin";  // Import Firebase admin for database operations
import { getRandomInterviewCover } from "@/lib/utils";  // Import utility for random cover images

// POST endpoint for generating interview questions
export async function POST(request: Request) {
  // Parse the request body
  const body = await request.json();
  console.log("📩 Incoming POST body:", body);
  console.log("🔑 GOOGLE_GENERATIVE_AI_API_KEY:", process.env.GOOGLE_GENERATIVE_AI_API_KEY);

  // Extract parameters from request body
  const { type, role, level, techstack, amount, userid } = body;

  try {
    // Generate interview questions using AI
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),  // Use Gemini AI model
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        Format: ["Question 1", "Question 2", "Question 3"]
      `,
    });

    console.log("🧠 Gemini returned:", questions);

    // Create interview object with generated questions
    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(","),  // Convert comma-separated string to array
      questions: JSON.parse(questions),  // Parse AI response into array
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),  // Get random cover image
      createdAt: new Date().toISOString(),  // Add timestamp
    };

    console.log("📝 Interview to be saved:", interview);

    // Save interview to database
    await db.collection("interviews").add(interview);

    return Response.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error in /api/vapi/generate:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET endpoint for health check
export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}

/* 
Modification Examples:
1. Add more interview parameters:
   - Add difficulty level
   - Add time limit
   - Add specific topics to focus on

2. Enhance AI prompt:
   - Add more specific question types
   - Include industry-specific context
   - Add follow-up questions

3. Add validation:
   - Validate input parameters
   - Add rate limiting
   - Add user authentication check

4. Add more features:
   - Save draft interviews
   - Add interview templates
   - Add question categories
*/

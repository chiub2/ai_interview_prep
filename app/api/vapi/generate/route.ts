import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  const body = await request.json();
  console.log("📩 Incoming POST body:", body);
  console.log("🔑 GOOGLE_GENERATIVE_AI_API_KEY:", process.env.GOOGLE_GENERATIVE_AI_API_KEY);

  const { type, role, level, techstack, amount, userid } = body;

  try {
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
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

    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(","),
      questions: JSON.parse(questions),
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    console.log("📝 Interview to be saved:", interview);

    await db.collection("interviews").add(interview);

    return Response.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error in /api/vapi/generate:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}

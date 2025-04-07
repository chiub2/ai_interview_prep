// feedback/page.tsx - Page component for displaying interview feedback
// This page shows detailed feedback and scores for a completed interview

import dayjs from "dayjs";  // Import for date formatting
import Link from "next/link";  // Import for navigation
import Image from "next/image";  // Import for optimized images
import { redirect } from "next/navigation";  // Import for redirects

// Import server actions and components
import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";

// Main feedback page component
const Feedback = async ({params} : RouteParams) => {
  // Get interview ID from URL parameters
  const {id} = await params;
  // Get current user and interview data
  const user = await getCurrentUser();
  const interview = await getInterviewById(id);
  // Redirect if interview not found
  if(!interview) redirect('/');

  // Get feedback for the interview
  const feedback = await getFeedbackByInterviewId({
      interviewId : id,
      userId: user?.id!,
    });

    return (
      <section className="section-feedback bg-white/10 backdrop-blur-lg p-8 rounded-xl border border-white/20">
        {/* Interview title */}
        <div className="flex flex-row justify-center mb-8">
          <h1 className="text-4xl font-semibold text-white">
            Feedback on the Interview -{" "}
            <span className="capitalize text-[#2ecc71]">{interview.role}</span> Interview
          </h1>
        </div>
  
        {/* Overall score and date */}
        <div className="flex flex-row justify-center mb-8">
          <div className="flex flex-row gap-5 bg-white/5 backdrop-blur-md p-4 rounded-lg border border-white/10">
            {/* Overall score display */}
            <div className="flex flex-row gap-2 items-center">
              <Image src="/star.svg" width={22} height={22} alt="star" />
              <p className="text-gray-200">
                Overall Impression:{" "}
                <span className="text-[#2ecc71] font-bold">
                  {feedback?.totalScore}
                </span>
                /100
              </p>
            </div>
  
            {/* Interview date */}
            <div className="flex flex-row gap-2">
              <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
              <p className="text-gray-200">
                {feedback?.createdAt
                  ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
  
        <hr className="border-white/10 my-8" />
  
        {/* Final assessment */}
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-lg border border-white/10 mb-8">
          <p className="text-gray-200">{feedback?.finalAssessment}</p>
        </div>
  
        {/* Detailed category scores */}
        <div className="flex flex-col gap-6 mb-8">
          <h2 className="text-2xl font-semibold text-white">Breakdown of the Interview:</h2>
          {feedback?.categoryScores?.map((category, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-md p-6 rounded-lg border border-white/10">
              <p className="font-bold text-[#2ecc71] mb-2">
                {index + 1}. {category.name} ({category.score}/100)
              </p>
              <p className="text-gray-200">{category.comment}</p>
            </div>
          ))}
        </div>
  
        {/* Strengths section */}
        <div className="flex flex-col gap-4 mb-8">
          <h3 className="text-xl font-semibold text-white">Strengths</h3>
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-lg border border-white/10">
            <ul className="list-disc list-inside text-gray-200 space-y-2">
              {feedback?.strengths?.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
        </div>
  
        {/* Areas for improvement */}
        <div className="flex flex-col gap-4 mb-8">
          <h3 className="text-xl font-semibold text-white">Areas for Improvement</h3>
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-lg border border-white/10">
            <ul className="list-disc list-inside text-gray-200 space-y-2">
              {feedback?.areasForImprovement?.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          </div>
        </div>
  
        {/* Navigation buttons */}
        <div className="flex gap-4 mt-8">
          <Button className="bg-white/10 hover:bg-white/20 text-white flex-1">
            <Link href="/" className="flex w-full justify-center">
              Back to dashboard
            </Link>
          </Button>
  
          <Button className="bg-[#2ecc71] hover:bg-[#27ae60] text-white flex-1">
            <Link
              href={`/interview/${id}`}
              className="flex w-full justify-center"
            >
              Retake Interview
            </Link>
          </Button>
        </div>
      </section>
    );
  };
  
  export default Feedback;

/* 
Modification Examples:
1. Add more feedback sections:
   - Add comparison with previous interviews
   - Add industry benchmarks
   - Add detailed technical feedback

2. Enhance visualization:
   - Add charts for scores
   - Add progress indicators
   - Add skill level indicators

3. Add interactive features:
   - Add feedback export
   - Add feedback sharing
   - Add feedback printing

4. Add more navigation options:
   - Add related interviews
   - Add learning resources
   - Add practice recommendations
*/
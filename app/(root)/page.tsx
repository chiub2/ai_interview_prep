import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewByUserId,
  getLatestInterviews,
  getFeedbackByInterviewId,
} from "@/lib/actions/general.action";

async function Home() {
  const user = await getCurrentUser();

  const [userInterviews, allInterview] = await Promise.all([
    getInterviewByUserId(user?.id!),
    getLatestInterviews({ userId: user?.id! }),
  ]);

  // Fetch feedback for user's interviews
  const userInterviewsWithFeedback = await Promise.all(
    userInterviews?.map(async (interview) => {
      const feedback = await getFeedbackByInterviewId({
        interviewId: interview.id,
        userId: user?.id!,
      });
      return { ...interview, feedback };
    }) || []
  );

  // Fetch feedback for all interviews
  const allInterviewsWithFeedback = await Promise.all(
    allInterview?.map(async (interview) => {
      const feedback = await getFeedbackByInterviewId({
        interviewId: interview.id,
        userId: user?.id!,
      });
      return { ...interview, feedback };
    }) || []
  );

  const hasPastInterviews = userInterviewsWithFeedback?.length > 0;
  const hasUpcomingInterviews = allInterviewsWithFeedback?.length > 0;

  return (
    <div className="flex flex-col gap-12 py-8">
      <section className="space-y-6 bg-white/10 backdrop-blur-lg p-8 rounded-xl border border-white/20 relative overflow-hidden">
        <div className="flex flex-col gap-6 max-w-lg relative z-10">
          <h2 className="text-white font-orbitron">Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p className="text-lg text-gray-300">
            Practice real interview questions & get instant feedback
          </p>

          <Button asChild className="bg-[#2ecc71] hover:bg-[#27ae60] text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 max-w-fit">
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>

        <div className="absolute right-0 bottom-0 max-sm:hidden">
          <Image
            src="/robot.png"
            alt="AI Interview Assistant"
            width={300}
            height={300}
            className="object-contain"
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-white font-orbitron">Your Interviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
          {hasPastInterviews ? (
            userInterviewsWithFeedback?.map((interview) => (
              <div key={interview.id} className="w-full h-full">
                <InterviewCard
                  userId={user?.id}
                  interviewId={interview.id}
                  role={interview.role}
                  type={interview.type}
                  techstack={interview.techstack}
                  createdAt={interview.createdAt}
                  feedback={interview.feedback}
                />
              </div>
            ))
          ) : (
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-xl border border-white/20">
              <p className="text-gray-400">You haven&apos;t taken any interviews yet</p>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-white font-orbitron">Take Interviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
          {hasUpcomingInterviews ? (
            allInterviewsWithFeedback?.map((interview) => (
              <div key={interview.id} className="w-full h-full">
                <InterviewCard
                  userId={user?.id}
                  interviewId={interview.id}
                  role={interview.role}
                  type={interview.type}
                  techstack={interview.techstack}
                  createdAt={interview.createdAt}
                  feedback={interview.feedback}
                />
              </div>
            ))
          ) : (
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-xl border border-white/20">
              <p className="text-gray-400">There are no interviews available</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;
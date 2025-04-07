"use client";

// InterviewCard.tsx - Component for displaying interview information in a card format
// This component shows interview details, feedback, and provides navigation options

import React from 'react'
import dayjs from 'dayjs'  // Import for date formatting
import Image from 'next/image';  // Import for optimized images
import Link from 'next/link';  // Import for navigation
import { Button } from './ui/button';  // Import UI button component
import { motion } from 'framer-motion';  // Import for animations
import { getRandomInterviewCover } from '@/lib/utils';  // Import utility for random cover images
import { getFeedbackByInterviewId } from '@/lib/actions/general.action';  // Import action for fetching feedback
import DisplayTechIcons from './DisplayTechIcons';  // Import component for tech stack icons

interface InterviewCardProps {
  interviewId: string;
  userId?: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt?: string;
  feedback?: any;
}

// Main InterviewCard component
const InterviewCard = ({interviewId, userId, role, type, techstack, createdAt, feedback }: InterviewCardProps) => {
    // Normalize interview type (convert 'mix' to 'Mixed')
    const normalizedType = /mix/gi.test(type) ? 'Mixed' : 'Technical';
    // Format date using feedback creation date or interview creation date
    const formattedDate = dayjs(feedback?.createdAt || createdAt|| Date.now()).format('MMMM D, YYYY');

    return (
      // Main card container with responsive width and hover effects
      <motion.div 
        className="w-full h-full relative group"
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{ zIndex: 1 }}
      >
        {/* Ripple effect background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2ecc71]/10 to-[#27ae60]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 overflow-hidden rounded-xl">
            <div className="ripple-1" />
            <div className="ripple-2" />
            <div className="ripple-3" />
          </div>
        </div>

        {/* Card content with glassmorphism */}
        <div className="flex flex-col justify-between bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 relative z-10 h-full transition-colors duration-300 group-hover:bg-white/20">
          <div className="space-y-5">
            {/* Interview type badge */}
            <div className='absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600/80 backdrop-blur-sm'>
              <p className='badge-text'>{normalizedType}</p>
            </div>

            {/* Interview cover image */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <Image 
                src={getRandomInterviewCover()} 
                alt="cover image" 
                width={90} 
                height={90} 
                className="rounded-full object-fit size-[90px]"
              />
            </motion.div>
            
            {/* Interview role title */}
            <h3 className='capitalize text-white font-orbitron'>
              {role} Interview
            </h3>

            {/* Date and score information */}
            <div className="flex flex-row gap-5">
              <div className='flex flex-row gap-2'>
                <Image src="/calendar.svg" alt='calendar' width={22} height={22} />
                <p>{formattedDate}</p>
              </div>
              <div className="flex flex-row gap-2">
                <Image src="/star.svg" alt='star' width={22} height={22} />
                <p>{feedback?.totalScore || '---'}/100</p>
              </div>
            </div>

            {/* Interview assessment or placeholder text */}
            <p className='line-clamp-2'>
              {feedback?.finalAssessment || "You haven't taken this interview yet. Take it now to improve your skills."}
            </p>
          </div>

          {/* Tech stack and action button */}
          <div className='flex flex-row justify-between items-center mt-auto pt-6'>
            <DisplayTechIcons techStack={techstack}/>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button className="btn-primary bg-[#2ecc71] hover:bg-[#27ae60] transition-colors duration-300">
                <Link href={feedback ? `/interview/${interviewId}/feedback` : `/interview/${interviewId}`}>
                  {feedback ? 'Check Feedback' : "View Interview"}
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    )
}

export default InterviewCard

/* 
Modification Examples:
1. Add more card information:
   - Add difficulty level indicator
   - Add estimated duration
   - Add number of questions
   - Add completion status

2. Enhance visual design:
   - Add hover effects
   - Add progress indicators
   - Add more interactive elements
   - Customize card layout

3. Add more features:
   - Add bookmark functionality
   - Add share button
   - Add quick actions menu
   - Add interview preview

4. Add more feedback display:
   - Add score breakdown
   - Add improvement suggestions
   - Add comparison with previous attempts
*/

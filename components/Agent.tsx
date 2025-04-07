"use client";
import Image from 'next/image'
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { vapi } from '@/lib/vapi.sdk'
import {interviewer} from '@/constants'
import { createFeedback } from '@/lib/actions/general.action'

// Define possible states for the interview call
enum CallStatus {
    INACTIVE = "INACTIVE",  // Initial state when no call is active
    ACTIVE = "ACTIVE",      // Call is ongoing
    CONNECTING = "CONNECTING",  // Establishing connection
    FINISHED = "FINISHED"   // Call has ended
}

// Define the structure for saved messages in the conversation
interface SavedMessage{
    role: 'user' | 'system' | 'assistant';  // Who sent the message
    content: string;  // The actual message content
}

// Main Agent component that handles the interview process
const Agent = ({userName, userId, type, interviewId, questions}: AgentProps) => {
    // Initialize router for navigation
    const router = useRouter();
    // State management for various aspects of the interview
    const [isSpeaking, setIsSpeaking] = useState(false);  // Track if AI is speaking
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);  // Track call state
    const [messages, setMessages] = useState<SavedMessage[]>([]);  // Store conversation history
    const lastMessage = messages[messages.length - 1];  // Get latest message
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // Set up event listeners for voice API interactions
    useEffect(() => {
        // Define event handlers for various voice API events
        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);  // Handle call start
        const onCallEnd = () => setCallStatus(CallStatus.FINISHED);  // Handle call end
        const onMessage = (message: Message) => {
            // Handle incoming messages, only process final transcripts
            if (message.type === "transcript" && message.transcriptType === "final" ){
                const newMessage = {role: message.role, content: message.transcript}
                setMessages((prev) => [...prev, newMessage]);
            }
        }

        const onSpeechStart = () => setIsSpeaking(true);  // Handle AI speech start
        const onSpeechEnd = () => setIsSpeaking(false);   // Handle AI speech end
        const onError = (error: Error) => console.log('Error', error)  // Handle errors
        
        // Register event listeners with the voice API
        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('message', onMessage);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);
        vapi.on('error', onError);

        // Cleanup function to remove event listeners when component unmounts
        return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('message', onMessage);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
            vapi.off('error', onError);
        }
    }, [])

    // Handle interview completion and navigation
    useEffect(() => {
        if (callStatus === CallStatus.FINISHED) {
            // Always navigate home after a delay
            setTimeout(() => {
                router.push('/');
            }, 1000);
        }
    }, [callStatus, router]);

    // Handle feedback generation after interview completion
    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
        console.log('Generate feedback here.');

        try {
            // Send transcript to API for feedback generation
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    interviewId: interviewId!,
                    userId: userId!,
                    transcript: messages
                }),
            });

            const { success, feedbackId: id } = await response.json();

            // Navigate to feedback page regardless of success
            router.push(`/interview/${interviewId}/feedback`);
        } catch (error) {
            console.error('Error creating feedback:', error);
            // Still navigate to feedback page even if there's an error
            router.push(`/interview/${interviewId}/feedback`);
        }
    }

    // Start the interview call
    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING);

        if (type === 'generate'){
            // Start interview generation workflow
            await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
                variableValues: {
                    username: userName,
                    userid: userId,
                }
            })
        } else {
            // Start regular interview with provided questions
            let formattedQuestions = "";
            if(questions){
                formattedQuestions = questions.map((question) => `-${question}`).join('\n');
            }

            await vapi.start(interviewer, {
                variableValues: {
                    questions: formattedQuestions,
                }
            })
        }
    }

    // End the interview call
    const handleDisconnect = async () => {
        setCallStatus(CallStatus.FINISHED);
        vapi.stop();
    }

    // Get latest message and check call status
    const latestMessage = messages[messages.length - 1]?.content;
    const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

    // Add this after the other useEffect hooks
    useEffect(() => {
        // Scroll to bottom whenever messages change
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Render the interview interface
    return (
        <div className="space-y-8">
            {/* Interview interface container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Interviewer card */}
                <div className='bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 transition-all hover:bg-white/15'>
                    <div className='flex items-center space-x-4'>
                        <div className='relative'>
                            <Image 
                                src="/ai-avatar.png" 
                                alt="vapi" 
                                width={65} 
                                height={65} 
                                className="rounded-full object-cover"
                            />
                            {isSpeaking && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse" />
                            )}
                        </div>
                        <h3 className="text-xl font-semibold text-white">AI Interviewer</h3>
                    </div>
                </div>

                {/* User card */}
                <div className='bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 transition-all hover:bg-white/15'>
                    <div className='flex items-center space-x-4'>
                        <Image 
                            src="/user-avatar.png" 
                            alt='user avatar' 
                            width={65} 
                            height={65} 
                            className='rounded-full object-cover'
                        />
                        <h3 className="text-xl font-semibold text-white">{userName}</h3>
                    </div>
                </div>
            </div>

            {/* Transcript display */}
            <div className='bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 h-[400px] transition-all'>
                <div className="h-full overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {messages.map((message, index) => (
                        <div 
                            key={index} 
                            className={cn(
                                "p-4 rounded-lg max-w-[80%] transition-all",
                                message.role === 'assistant' 
                                    ? "bg-green-500/20 ml-auto" 
                                    : "bg-blue-500/20"
                            )}
                        >
                            <p className="text-sm text-white/60 mb-1">
                                {message.role === 'assistant' ? 'AI Interviewer' : 'You'}:
                            </p>
                            <p className="text-white">
                                {message.content}
                            </p>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                    {messages.length === 0 && (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-white/40">Your conversation will appear here...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Call controls */}
            <div className='flex justify-center pt-4'>
                {callStatus !== 'ACTIVE' ? (
                    <button 
                        className={cn(
                            "px-8 py-3 rounded-full font-semibold transition-all",
                            "bg-gradient-to-r from-[#2ecc71] to-[#27ae60] hover:from-[#27ae60] hover:to-[#219a52]",
                            "text-white shadow-lg hover:shadow-xl",
                            "flex items-center space-x-2",
                            callStatus === 'CONNECTING' && "opacity-75"
                        )}
                        onClick={handleCall}
                    >
                        {callStatus === 'CONNECTING' && (
                            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        )}
                        <span>
                            {isCallInactiveOrFinished ? "Start Interview" : "Connecting..."}
                        </span>
                    </button>
                ) : (
                    <button 
                        className="px-8 py-3 rounded-full font-semibold transition-all bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl"
                        onClick={handleDisconnect}
                    >
                        End Interview
                    </button>
                )}
            </div>
        </div>
    )
}

export default Agent

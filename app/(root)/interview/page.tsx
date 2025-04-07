import Agent from '@/components/Agent'
import { getCurrentUser } from '@/lib/actions/auth.action'
import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const page = async () => {
  const user = await getCurrentUser();
  if (!user?.id || !user?.name) redirect('/');
  
  return (
    <div className="min-h-screen p-6 space-y-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white font-orbitron bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Interview Generation
          </h1>
          <Link 
            href="/"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all border border-white/20"
          >
            
            <span className="text-white/80">Return Home</span>
          </Link>
        </div>
        
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
          <Agent userName={user.name} userId={user.id} type="generate"/>
        </div>
      </div>
    </div>
  )
}

export default page

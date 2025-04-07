import {ReactNode} from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {isAuthenticated} from '@/lib/actions/auth.action'
import {redirect} from 'next/navigation'
import AnimatedBackground from '@/components/AnimatedBackground'

const RootLayout = async ({children}: {children: ReactNode}) => {
  const isUserAuthenticated = await isAuthenticated();
  if(!isUserAuthenticated) redirect("/sign-in");
  
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      <div className="relative z-10">
        <nav className="flex justify-between items-center py-6 px-16 max-sm:px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="logo" width={38} height={32} />
            <h2 className="text-primary-100 text-white font-orbitron">PrepVue</h2>
          </Link>
        </nav>
        
        <div className="mx-auto w-full max-w-7xl px-16 max-sm:px-4">
          {children}
        </div>
      </div>
    </div>
  )
}

export default RootLayout

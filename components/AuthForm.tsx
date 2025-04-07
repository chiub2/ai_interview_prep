"use client"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/firebase/client"
import { signIn, signUp } from "@/lib/actions/auth.action"
import { useState } from 'react'
import AnimatedBackground from '@/components/AnimatedBackground'
import { motion } from 'framer-motion'

// AuthForm.tsx - Component for handling user authentication
// This component provides forms for user sign-in and sign-up

// Define props interface
interface AuthFormProps {
    type: 'sign-in' | 'sign-up';  // Form type (sign in or sign up)
}

// Define form schemas
const signInSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type SignInFormData = z.infer<typeof signInSchema>
type SignUpFormData = z.infer<typeof signUpSchema>

// Sign In Form Component
const SignInForm = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values: SignInFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { email, password } = values
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await userCredential.user.getIdToken()
      
      if (!idToken) {
        toast.error("Sign in failed")
        return
      }
      
      await signIn({ email, idToken })
      toast.success("Signed in successfully")
      router.push('/')
    } catch (err: any) {
      setError(err.message || "An error occurred")
      toast.error(err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-200">Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ecc71] text-white"
                  placeholder="Enter your email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-200">Password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ecc71] text-white"
                  placeholder="Enter your password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-sm"
          >
            {error}
          </motion.p>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#2ecc71] hover:bg-[#27ae60] text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>

        <p className="text-center text-gray-400 text-sm">
          Don't have an account?{' '}
          <Link 
            href="/sign-up" 
            className="text-[#2ecc71] hover:text-[#27ae60]"
          >
            Sign up
          </Link>
        </p>
      </form>
    </Form>
  )
}

// Sign Up Form Component
const SignUpForm = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values: SignUpFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { name, email, password } = values
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const signUpResult = await signUp({
        uid: userCredential.user.uid,
        name,
        email,
        password
      })

      if (!signUpResult?.success) {
        toast.error(signUpResult?.message || "Failed to sign up")
        return
      }
      toast.success("Account created successfully")
      router.push('/sign-in')
    } catch (err: any) {
      setError(err.message || "An error occurred")
      toast.error(err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-200">Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ecc71] text-white"
                  placeholder="Enter your name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-200">Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ecc71] text-white"
                  placeholder="Enter your email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-200">Password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ecc71] text-white"
                  placeholder="Enter your password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-sm"
          >
            {error}
          </motion.p>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#2ecc71] hover:bg-[#27ae60] text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
        >
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </Button>

        <p className="text-center text-gray-400 text-sm">
          Already have an account?{' '}
          <Link 
            href="/sign-in" 
            className="text-[#2ecc71] hover:text-[#27ae60]"
          >
            Sign in
          </Link>
        </p>
      </form>
    </Form>
  )
}

// Main authentication form component
const AuthForm = ({ type }: AuthFormProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <AnimatedBackground />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-8"
      >
        <motion.h1 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-6xl font-bold text-center mb-8 text-white font-orbitron"
        >
          PREPVUE
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-6 bg-white/10 backdrop-blur-lg p-8 rounded-xl border border-white/20"
        >
          {type === 'sign-up' ? <SignUpForm /> : <SignInForm />}
        </motion.div>
      </motion.div>
    </div>
  )
}

export default AuthForm

/* 
Modification Examples:
1. Add more form fields:
   - Add password confirmation
   - Add phone number
   - Add profile picture
   - Add social media links

2. Enhance validation:
   - Add password strength indicator
   - Add email format validation
   - Add custom validation rules
   - Add real-time validation

3. Add more features:
   - Add social login options
   - Add "Remember me" option
   - Add password reset
   - Add email verification

4. Improve UX:
   - Add form animations
   - Add success messages
   - Add loading indicators
   - Add form progress
*/

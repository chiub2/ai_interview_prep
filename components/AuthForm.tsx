"use client"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import {useRouter} from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import FormField from "@/components/FormField";
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/firebase/client"
import { signIn, signUp } from "@/lib/actions/auth.action"
import { signInWithEmailAndPassword } from "firebase/auth"
const formSchema = z.object({
  username: z.string().min(2).max(50),
})


const authFormScehma = (type: FormType) => {
  return z.object({
    name: type === 'sign-up' ? z.string().min(2) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(8),
    
  })
}

const AuthForm = ({type} : {type: FormType}) => {
  const router = useRouter();
  const formSchema = authFormScehma(type);
   // 1. Define your form.
   const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })
 
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    try{
      if (type === 'sign-up'){
        const {name, email, password} = values;
        const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
        const result = await signUp({
          uid: userCredentials.user.uid,
          name: name!,
          email: email,
          password: password
        })
        if (!result?.sucess){
          toast.error(result?.message);
          return;
        }
        toast.success("Account created successfully. Please sign in.")
        router.push('/sign-in')
      } else {
          const {email, password} = values;
          const userCredentials = await signInWithEmailAndPassword(auth, email, password);
          const idToken = await userCredentials.user.getIdToken();
          if(!idToken){
            toast.error("Sign in failed")
            return;
          }
          await signIn({
            email, idToken
          })
          toast.success("Sign in successfully")
          router.push('/')
      }
    } catch(error){
      console.log(error)
      toast.error("Something went wrong: ${error}")
    }
  }

  const isSignin = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <img src="/logo.svg" alt="logo" width={38} height={32} />
          <h2 className = "text-primary-100">PrepVue</h2>
        </div>
          <h3>Practice Job Interviews with AI</h3>
      
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
        {!isSignin && (
          <FormField  
              control={form.control} 
              name= "name" 
              label="Name" 
              placeholder = 'Your Name'/>
        )}
        <FormField 
              control={form.control} 
              name= "email" 
              label="Email" 
              placeholder = 'Your email address'
              type = "email"
              />
        <FormField 
              control={form.control} 
              name= "password" 
              label="Password" 
              placeholder = 'Enter your password'
              type = 'password'/>

        <Button className = "btn" type="submit">{isSignin ? "Sign In" : "Create an Account"}</Button>
      </form>
    </Form>
    <p className="text-center">
       {isSignin ? 'No account yet?' : 'Have an account already?'}
       <Link href = {!isSignin ? '/sign-in' : '/sign-up'} className = "font-bold text-primary-100 ml-1">
        {!isSignin ? "Sign in" : "Sign up"}
       </Link>
    </p>
    </div>
    </div>
  )
}

export default AuthForm

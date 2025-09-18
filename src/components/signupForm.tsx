"use client"
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import React from "react"
import Link from "next/link"
import { signUpSchema} from "~/schemas/auth"
import type  {SignUpFormValues}  from "~/schemas/auth"
import { signUp } from "~/actions/auth"
import {signIn} from "next-auth/react"
import { useRouter } from "next/navigation"

export function SignUpForm({
  className, 
  ...props
}: React.ComponentProps<"form">) {


    const [error,setError]=React.useState<string|null>(null);
    const [isSubmitting,setIsSubmitting]=React.useState(false)
    const router=useRouter()

    const {
        register,
        handleSubmit,
        formState:{errors}
    }= useForm<SignUpFormValues>({resolver:zodResolver(signUpSchema)})
    const onSubmit=async(data:SignUpFormValues)=>{
        try{
            setIsSubmitting(true)
            setError(null)

            const result=await signUp(data);
            console.log(result)
            if(!result.success){
                setError(result.error ?? "an error occured during sign up")
                return
            }

            // sign in the user
            // instead of credentials we can login with a lot of providers and based on
            // the provider we send the information
            const signUpResult=await signIn("credentials",{
                email:data.email,
                password:data.password,
                redirect:false
            })

            if (signUpResult?.error){
                setError("account created, but could not sign in. Please ttry again")
            }else{
                // redirect the user to the platform
                router.push("/dashboard")
            }


        }catch(error){
          console.error(error)
            setError("An error occured")
        }finally{
            setIsSubmitting(false)
        }
    }
    return (
      <form onSubmit={handleSubmit(onSubmit)} className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Sign up to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to sign up to your account
          </p>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required {...register("email")} />
            {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-3">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input id="password" type="password" required {...register("password")}/>
            {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          {error && (
                <p className="text-sm text-red-500 rounded-md bg-red-50 pd-3">{error}</p>
            )}
        
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting?"Signing up...":"Sign Up"}
          </Button>
          
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-2">
              Or continue with
            </span>
          </div>

        </div>
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline underline-offset-4">
            Sign in
          </Link>
        </div>
      </form>
    )
}   

"use server"
import { redirect } from "next/navigation"
import {auth} from "~/server/auth"

import { GalleryVerticalEnd } from "lucide-react"
import { SignUpForm } from "~/components/signupForm"
import Image from "next/image"

export default async function Page(){
    const session=await auth()
    // auth gives the current user session of logged in or nnot logged in
    // if session actove then redirect to dashboard
    if(session){
        redirect("/dashboard")
    }



    return (
      <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            AI-Podcast Clipper
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignUpForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
    )
}
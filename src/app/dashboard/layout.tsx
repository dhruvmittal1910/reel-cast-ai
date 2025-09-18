import "~/styles/globals.css";

import { type Metadata } from "next";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import Navbar from "~/components/navbar";
import { Toaster } from "~/components/ui/sonner";

export const metadata: Metadata = {
  title: "AI Podcast Clipper",
  description: "Podcast Clipper",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

// const geist = Geist({
//   subsets: ["latin"],
//   variable: "--font-geist-sans",
// });

export default async function DashboardLayout({
  children,
}: { children: React.ReactNode }) {

    const session=await auth()
    // get the user sesisona nd amount of credits user has
    if(!session?.user?.id){
        redirect("/login")
    }

    const user=await db.user.findUniqueOrThrow({
        where:{
            id:session.user.id,
        },
        select:{
            credits:true,
            email:true
        }
    })

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 via-yellow to-orange-100">
            <Navbar credits={user.credits} email={user.email} />
            <main className="container mx-auto flex-1 py-6 ">{children}</main>
            <Toaster/>
        </div>
    );
}

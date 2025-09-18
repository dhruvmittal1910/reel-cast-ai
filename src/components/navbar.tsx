"use client"
import Link from "next/link"
import {Badge} from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger,DropdownMenuSeparator, DropdownMenuItem } from "~/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { signOut } from "next-auth/react"

const Navbar=({credits,email}:{credits:number,email:string|null})=>{
    return(
        <header className=" bg-background sticky m-5 z-10 flex justify-center border rounded-lg shadow-2xl border-transparent transition-colors duration-300 hover:border-gray-500 ">
            <div className="container flex h-16 items-center justify-between px-4 py-2">
                <Link href="/dashboard"className="flex items-center">
                    <div className="font-sans text-xl font-medium tracking-tight">
                        <span className="text-foreground">ReelCast </span>
                        <span className="text-gray-500 font-light">AI</span>
                    </div>
                </Link>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Badge variant={"outline"} className="border-b-4 h-9 py-1.5 text-sm font-medium">
                            {credits} Credits
                        </Badge>
                        <Button variant={"default"} className="h-9 py-1.5 text-sm font-medium" asChild>
                            <Link href="/dashboard/billing" >
                                Buy More Credits
                            </Link>
                        </Button>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Button variant={"outline"} className="relative h-8 w-8 rounded-full p-5 hover:bg-red-50">
                                <Avatar>
                                    <AvatarFallback className="text-lg">
                                        {email?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                                <p className="text-muted-foreground text-sm">{email}</p>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem asChild>
                              <Link href="/dashboard/billing">Billing</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => signOut({ redirectTo: "/login" })}
                              className="text-destructive cursor-pointer"
                            >
                              Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                </div>
            </div>
        </header>
    )
}

export default Navbar
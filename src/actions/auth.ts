"use server"

import { signUpSchema, type SignUpFormValues } from "~/schemas/auth"
import { db } from "~/server/db"
import { hashPassword } from "~/lib/auth"
import Stripe from "stripe"
import { env } from "~/env"
type SignUpResult={
    success:boolean,
    error?:string
}

const stripe=new Stripe(env.STRIPE_SECRET_KEY)

export async function signUp(data:SignUpFormValues):Promise<SignUpResult>{
    // server side form validation so even if user modifies on client side, on server they cannot
    const validationResult=signUpSchema.safeParse(data)
    if(!validationResult.success){
        // error in schema
        return {
            success:false,
            error:validationResult.error.issues[0]?.message ?? "invalid input"
        }
    }

    const {email,password}=validationResult.data

    try{
        // check if user exists or not
        const existingUser=await db.user.findUnique({
            where:{
                email:email
            }
        })
        if (existingUser){
            return {
                success:false,
                error:"A user with same Email already exists"
            }
        }

        // hash the passowrd 
        const hashedPassword=await hashPassword(password)

        // sign up the user in stripe as well
        const stripeCustomer=await stripe.customers.create({
            email:email.toLowerCase(),
        })

        await db.user.create({
            data:{
                email:email,
                password:hashedPassword,
                stripeCustomerId:stripeCustomer.id
            }
        })

        return {success:true}

    }catch(error){
        return {
            success:false,
            error:"An error occured during signup "+String(error)
        }
    }
}
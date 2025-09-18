"use server"
import Stripe from "stripe"
import { env } from "~/env"
import { auth } from "~/server/auth"
import { db } from "~/server/db"
import { redirect } from "next/navigation"

const stripe=new Stripe(env.STRIPE_SECRET_KEY,{
    apiVersion: "2025-08-27.basil" as Stripe.LatestApiVersion,
})

export type PriceId="small"|"medium"|"large"

const price_ids:Record<PriceId,string>={
    small:env.STRIPE_SMALL_CREDIT_PACK,
    medium:env.STRIPE_MEDIUM_CREDIT_PACK,
    large:env.STRIPE_LARGE_CREDIT_PACK
}

export async function createCheckoutSession(priceId:PriceId){
    const serverSession=await auth()

    const user=await db.user.findUniqueOrThrow({
        where:{
            id:serverSession?.user?.id
        },
        select:{
            stripeCustomerId:true
        }
    })

    

    if(!user.stripeCustomerId){
        throw new Error("user does not have stripe customer id, create new account again")
    }

    console.log("--stripe-customer id",user.stripeCustomerId)
    const session=await stripe.checkout.sessions.create({
        line_items:[
            {
                price:price_ids[priceId],
                quantity:1
            }
        ],
        customer:user.stripeCustomerId,
        mode:"payment",
        success_url:`${env.BASE_URL}/dashboard?success=true`
    })

    if(!session.url){
        throw new Error("Failed to create stripe session")
    }

    redirect(session.url)

}
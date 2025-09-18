// stripe listen --forward-to localhost:3000/api/webhooks/stripe

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { env } from "~/env";
import { db } from "~/server/db";

const stripe=new Stripe(env.STRIPE_SECRET_KEY,{
    apiVersion: "2025-08-27.basil" as Stripe.LatestApiVersion,
})

const webhookSecret=env.STRIPE_WEBHOOK_SECRET;

export async function POST(req:Request) {
    console.log("🔔 Stripe webhook hit!");

    try{
        // verify if thhe request is from stripe
        const body=await req.text()
        const signature=req.headers.get("stripe-signature")??""
        let event:Stripe.Event;
        try{
            event=stripe.webhooks.constructEvent(body,signature,webhookSecret)
        }catch(error){
            // reject the user
            console.error("Webhook signature verificationn failed: "+String(error))
            return new NextResponse("webhook signature verificatin failed",{
                status:400
            })
        }

        console.log("Received event type:", event.type);

        if(event.type==="checkout.session.completed"){
            console.log("✅ Checkout session completed:", event.data.object.id);
            const session=event.data.object;
            const customerId=session.customer as string

            const retrievedSession=await stripe.checkout.sessions.retrieve(session.id,{
                expand:["line_items"]
            })
            const lineItems=retrievedSession.line_items
            
            if(lineItems && lineItems.data.length>0){
                // get the price id
                const priceId=lineItems.data[0]?.price?.id ?? undefined
                console.log("Webhook Price ID:", priceId);
                console.log("Expected Small:", env.STRIPE_SMALL_CREDIT_PACK);
                if(priceId){
                    // we have the user who bought and what they bout
                    let creditsToAdd=0
                    if(priceId===env.STRIPE_SMALL_CREDIT_PACK){
                        creditsToAdd=50
                    }else if(priceId===env.STRIPE_MEDIUM_CREDIT_PACK){
                        creditsToAdd=150
                    }else if(priceId===env.STRIPE_LARGE_CREDIT_PACK){
                        creditsToAdd=500
                    }


                    console.log("Webhook customerId:", customerId);

                    const dbUser = await db.user.findUnique({
                      where: { stripeCustomerId: customerId },
                    });
                    console.log("Found user in DB:", dbUser);


                    // update into the db
                    await db.user.update({
                        where:{
                            stripeCustomerId:customerId
                        },
                        data:{
                            credits: {
                                increment: creditsToAdd
                            }
                        }
                    })

                }
            }
        }
        return new NextResponse(null,{status:200})

    }catch(error){
        console.error("error processing the webhook: ",error )
        return new NextResponse("webhook error",{
            status:500
        })
  
    }
}
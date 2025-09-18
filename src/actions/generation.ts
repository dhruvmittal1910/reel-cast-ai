
"use server"

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { revalidatePath } from "next/cache"
import { env } from "~/env"
import { inngest } from "~/inngest/client"
import { auth } from "~/server/auth"
import { db } from "~/server/db"

export async function processVideo(uploadedFileId:string){
    // 
    const uploadedVideo=await db.uploadedFile.findUniqueOrThrow({
        where:{
            id:uploadedFileId
        },
        select:{
            uploaded:true,
            id:true,
            userId:true
        }
    })

    // make sure uploaded file is processed only once
    if(uploadedVideo.uploaded){
        return
    }

    // insert into queue
    // call the process video events function present in function.ts that will process the video

    await inngest.send({
        name:"process-video-events",
        data:{
            uploadedFileId:uploadedVideo.id,
            userId:uploadedVideo.userId
        }
    })


    await db.uploadedFile.update({
        where:{
            id:uploadedFileId
        },
        data:{
            uploaded:true
        }
    })

    revalidatePath("/dashboard")

}

export async function getClipPlayUrl(clipId:string):Promise<{success:boolean;url?:string;error?:string}>{
    const session=await auth()
    if(!session?.user?.id){
        return {success:false,error:"UNauthorized"}
    }

    try{
        // find all clips
        const clip=await db.clip.findUniqueOrThrow({
            where:{
                id:clipId,
                userId:session.user.id
            }
        })

        const s3Client=new S3Client({
            region:env.AWS_REGION,
            credentials:{
                accessKeyId:env.AWS_ACCESS_KEY_ID,
                secretAccessKey:env.AWS_SECRET_ACCESS_KEY
            }
        })

        // get command
        const cmd=new GetObjectCommand({
            Bucket:env.S3_BUCKET_NAME,
            Key:clip.s3Key 
        })
        // now get the signedUrl
        const signedUrl=await getSignedUrl(s3Client,cmd,{
            expiresIn:3600
        })

        return {success:true,url:signedUrl}

    }catch(error){
        console.error("cannot fetch the clips : "+String(error))
        return {success:false,error:"Failed to generate play URL."}
    }
}
"use server"

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "~/env";
import { auth } from "~/server/auth";
import {v4 as uuidv4} from "uuid"
import {getSignedUrl} from "@aws-sdk/s3-request-presigner"
import { db } from "~/server/db";

export async function generateUploadUrl(fileInfo:{
    filename:string;contentType:string;
}):Promise<{success:boolean,signedUrl:string,key:string,uploadedFileId:string}> {
    const session=await auth()

    // get id of current user
    if(!session) throw new Error("unauthorized")

    const s3Client=new S3Client({
        region:env.AWS_REGION,
        credentials:{
            accessKeyId:env.AWS_ACCESS_KEY_ID,
            secretAccessKey:env.AWS_SECRET_ACCESS_KEY
        }
    })

    // get file extension from file name
    const fileExtension=fileInfo.filename.split(".").pop() ?? ""
    if(fileExtension!=="mp4"){

    }

    // generate a unique id for the video uploaded
    const uniqueId=uuidv4() //uuid/orignal.mp4
    // s3key is the uuid
    // clip created will be like uuid/clip0.mp4
    const s3Key=`${uniqueId}/original.${fileExtension}`
    
    const cmd=new PutObjectCommand({
        Bucket:env.S3_BUCKET_NAME,
        Key:s3Key,
        ContentType:fileInfo.contentType,
    })

    // presigned url
    const signedUrl=await getSignedUrl(s3Client,cmd,{
        expiresIn:600
    })

    const uploadFileDbRecord=await db.uploadedFile.create({
        data:{
            userId:session.user.id,
            s3Key:s3Key,
            displayName:fileInfo.filename,
            uploaded:false
        },
        select:{
            id:true,
        }
    })

    return {
        success:true,
        signedUrl:signedUrl,
        key:s3Key,
        uploadedFileId:uploadFileDbRecord.id
    }


}
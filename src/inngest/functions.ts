import { env } from "~/env";
import { inngest } from "./client";
import { db } from "~/server/db";
import {ListObjectsV2Command, S3Client} from "@aws-sdk/client-s3"

type ProcessVideoEvent = {
  name: "process-video-events";
  data: {
    uploadedFileId: string;
  };
};

// queue will contain the events
// functions that will triggered from the queue
export const processVideo = inngest.createFunction(
  {
    id: "process-video",
    retries: 1, // it will retry 2 times, 0->1 and 1->2
    concurrency: [
      {
        key: "event.data.userId",
        limit: 1 //limit set to 1 for each user
      }
    ]
  },
  { event: "process-video-events" },
  async ({ event, step }: {
    event: ProcessVideoEvent;
    step: {
      run<T>(name: string, fn: () => Promise<T>): Promise<T>;
    };
  }) => {
    const { uploadedFileId } = event.data

    // inside the try cathc block inorder to do faulure handling as shown in inngest docs under step errors
    try{
          // check user credentials
      const { userId, credits, s3Key } = await step.run("check-user-credentials", async (): Promise<{ userId: string; credits: number; s3Key: string }> => {
        const uploadedFile = await db.uploadedFile.findUniqueOrThrow({
          where: {
            id: uploadedFileId
          },
          select: {
            // getting the user details
            user: {
              select: {
                id: true,
                credits: true,
              }
            },
            // getting th s3key from uploaded file
            s3Key: true,
          }
        })
        return {
          userId: uploadedFile.user.id,
          credits: uploadedFile.user.credits,
          s3Key: uploadedFile.s3Key
        }
      })


      // check if user has more than 0 credits then only move forward with calling the modal endpoint
      if (credits > 0) {
        // mark the status in uploadedfile as processing
        await step.run("set-status-processing",async()=>{
          await db.uploadedFile.update({
            where:{
              id:uploadedFileId
            },
            data:{
              status:"processing"
            }
          })
        })

        await step.run("call-modal-endpoint", async () => {
          await fetch(env.PROCESS_VIDEO_ENDPOINT, {
            method: "POST",
            body: JSON.stringify({ s3_key: s3Key }), //hardcoding the s3key for now
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${env.PROCESS_VIDEO_ENDPOINT_AUTH}`
            }
          })
        })

        // after modal endpoint is hit then more clips are added to the s3 bucket
        // check if clips have been added by checking the s3 folder using s3 api

        const {clipsFound} =await step.run("create-clips-in-db",async()=>{
          const folderPrefix=s3Key.split("/")[0]!;
          // use aws s3 api to check folder
          // allKeys contains the clip names if generated
          const allKeys=await listS3ObjectsByPrefix(folderPrefix)
          // only get the clips not the orginal video
          // original.mp4 is the main clip that we are processing 
          const clipKeys=allKeys.filter(
            (key):key is string=> key!==undefined && !key.endsWith("original.mp4")
          )

          // send the keys to database
          if (clipKeys.length>0){
            await db.clip.createMany({
              data:clipKeys.map((clipKey)=>({
                s3Key:clipKey,
                uploadedFileId,
                userId,
              }))
            })
          }

          return {clipsFound:clipKeys.length}

        })

        // decrement the credits
        await step.run("deduct-credits",async()=>{
          // update the user table 
          await db.user.update({
            where:{
              id:userId
            },
            data:{
              credits:{
                decrement: Math.min(credits,clipsFound)
              }
            }
          })
        })

        // mark the video as processed
        await step.run("set-status-processed",async()=>{
          await db.uploadedFile.update({
            where:{
              id:uploadedFileId
            },
            data:{
              status:"processed"
            }
          })
        })

      }else{
        // if user has 0 or less credits
        await step.run("set-status-no-credits",async()=>{
          await db.uploadedFile.update({
            where:{
              id:uploadedFileId,
            },
            data:{
              status:"no credits"
            }
          })
        })
      }

    }catch(error){
      
      await db.uploadedFile.update({
        where:{
          id:uploadedFileId
        },
        data:{
          status:"failed"
        }
      })
      console.error(error)

    }


  },
);

async function listS3ObjectsByPrefix(folderPrefix:string){
  const s3Client=new S3Client({
    region:env.AWS_REGION,
    credentials:{
      accessKeyId:env.AWS_ACCESS_KEY_ID,
      secretAccessKey:env.AWS_SECRET_ACCESS_KEY
    },
  })

  const listCommand=new ListObjectsV2Command({
    Bucket:env.S3_BUCKET_NAME,
    Prefix:folderPrefix
  })


  const response=await s3Client.send(listCommand)
  if (!response.Contents) {
    console.warn("No contents found in S3 response.");
    return [];
  }
  return response.Contents?.map((item)=>item.Key).filter((key): key is string => typeof key === "string") || [];

}

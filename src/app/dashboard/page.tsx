
import { redirect } from 'next/navigation'
import React from 'react'
import { auth } from '~/server/auth'
import { db } from '~/server/db'
import { DashboardClient } from '~/components/dashboard'
const DashboardPage = async() => {
  const session=await auth()

  if(!session?.user?.id){
    redirect("/login")
  }

  // get the user data
  const userData=await db.user.findUniqueOrThrow({
    where:{
      id:session.user.id
    },
    select:{
      // get user uploaded files
      uploadedFiles:{
        where:{
          uploaded:true
        },
        select:{
          id:true,
          s3Key:true,
          displayName:true,
          status:true,
          createdAt:true,
          _count:{
            select:{
              clips:true
            }
          }
        }
      },
      clips:{
        orderBy:{
          createdAt:"desc"
        }
      }
    }
  })

  const formattedFiles=userData.uploadedFiles.map((file)=>({
    id:file.id,
    s3Key:file.s3Key,
    filename:file.displayName ?? "Unknown",
    status:file.status,
    clipCount:file._count.clips,
    createdAt:file.createdAt
  }))

  return (
    <div>
      <DashboardClient uploadedFiles={formattedFiles} clips={userData.clips}/>
    </div>
  )
}

export default DashboardPage

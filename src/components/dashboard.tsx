"use client"

import type { Clip } from "@prisma/client"
import Link from "next/link";
import { Button } from "./ui/button";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Dropzone,{ type DropzoneState} from "shadcn-dropzone"
import { UploadCloud,LoaderPinwheel } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateUploadUrl } from "~/actions/s3";
import { toast } from "sonner";
import { processVideo } from "~/actions/generation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import {ClipDisplay} from "./clip-display"
export function DashboardClient({
    uploadedFiles,
    clips
}:{
    uploadedFiles:{
        id:string,
        s3Key:string,
        filename:string,
        status:string,
        clipCount:number,
        createdAt:Date
    }[];
    clips:Clip[]
}){


    const [files,setFiles]=useState<File[]>([])
    const [uploading,setUploading]=useState(false)
    const [refreshing,setRefreshing]=useState(false)
    const router=useRouter()

    const handleDrop=async(acceptedFiles:File[])=>{
        setFiles(acceptedFiles)
    }

    const handleUpload=async()=>{
        if(files.length===0){
            return 
        }
        const file=files[0]!
        setUploading(true)
        try{
            // generate upload file
            // upload file to s3 bucket
            // client to s3bucket
            const {success,signedUrl,uploadedFileId}=await generateUploadUrl({
                filename:file.name,
                contentType:file.type
            })

            if(!success){
                throw new Error("Failed to upload URL")
            }
            
            const uploadResult=await fetch(signedUrl,{
                method:"PUT",
                body:file,
                headers:{
                    "Content-Type":file.type,
                }
            })

            if(!uploadResult.ok){
                throw new Error(`Upload filed with status ${uploadResult.status}`)
            }

            // call process video action event in inngest
            await processVideo(uploadedFileId)

            setFiles([])
            toast.success("Video Uploaded Successfully",{
                description:"Your video has been scheduled for processing. Check the Status below",
                duration:5000
            })
            
            
        }catch(err){
            console.error("Upload failed: ",err)
            toast.error("Upload Failed",{
                description:"There was a problem uploading your video, please try again.."
            })
        }finally{
            setUploading(false)
        }

    }
    
    const handleRefresh=async()=>{
        setRefreshing(true)
        router.refresh();
        setTimeout(()=>setRefreshing(false),600);
    }



    return (
        <div className="mx-auto flex max-w-5xl flex-col space-y-6 px-4 py-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        VIDEO CLIPPER
                    </h1>
                    <p className="text-muted-foreground">
                        Upload your Video and get AI-generated clips instantly
                    </p>
                </div>
                <Link href="/dashboard/billing">
                    <Button className="cursor-pointer">Buy Credits</Button>
                </Link>
            </div>

            {/* uploading the video */}
            <Tabs defaultValue="upload">
                <TabsList>
                    <TabsTrigger value="upload">Upload a new video</TabsTrigger>
                    <TabsTrigger value="my-clips">My Clips</TabsTrigger>
                </TabsList>

                <TabsContent value="upload">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload Video</CardTitle>
                            <CardDescription>
                                Upload your Audio or Video file to generate clips
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Dropzone
                                onDrop={handleDrop}
                                accept={{"video/mp4":[".mp4"]}}
                                maxSize={500*1024*1024}
                                disabled={uploading}
                                maxFiles={1}
                            >
                                {(_dropzone:DropzoneState)=>(
                                    <>
                                    <div className="flex flex-col items-center justify-center space-y-4 rounded-lg p-10 text-center">
                                        <UploadCloud className="text-muted-foreground h-12 w-12" />
                                        <p className="font-medium">Drag and Drop your Video Files</p>
                                        <p className="text-muted-foreground text-sm">
                                            or click to browse (MP4 upto 500MB)
                                        </p>
                                        <Button className="cursor-pointer" variant="default" size="sm" disabled={uploading}>
                                            Select File
                                        </Button>
                                    </div>
                                    </>
                                )}
                            </Dropzone>
                            <div className="mt-2 flex items-start justify-between">
                                <div>
                                    {files.length>0 && (
                                        <div className="space-y-1 text-sm">
                                            <p className="font-medium">Selected File</p>
                                            {files.map((file)=>(
                                                <p key={file.name} className="text-muted-foreground">
                                                    {file.name}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <Button onClick={handleUpload} disabled={files.length===0 || uploading}>{uploading ? <>
                                    <LoaderPinwheel className="mr-2 -4 animate-spin"/>
                                        Uploading...
                                </>:<>
                                    Upload & Generate Clips
                                </> }</Button>
                            </div>
                            {/* uploaded file history */}
                            {uploadedFiles.length>0 && (
                                <div className="pt-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-md mb-2 font-medium">Queue Status</h3>
                                        <Button variant={"outline"} size="sm" onClick={handleRefresh} disabled={refreshing}>
                                            {refreshing && <LoaderPinwheel className="mr-2 h-4 animate-spin"/> }
                                            Refresh
                                        </Button>
                                    </div>
                                    <div className="max-h-[300px] overflow-auto rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>File</TableHead>
                                                    <TableHead>Uploaded</TableHead>
                                                    <TableHead>Processed</TableHead>
                                                    <TableHead>Clips created</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {uploadedFiles.map((item)=>(
                                                    <TableRow key={item.id}>
                                                        <TableCell>
                                                            {item.filename}
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(item.createdAt).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            {item.status==="queued" && (
                                                                <Badge variant={"outline"}>Queued</Badge>
                                                            )}
                                                            {item.status==="processing" && (
                                                                <Badge variant={"outline"}>Processing</Badge>
                                                            )}
                                                            {item.status==="processed" && (
                                                                <Badge variant={"default"}>Processed</Badge>
                                                            )}
                                                            {item.status==="no credits" && (
                                                                <Badge variant={"destructive"}>No credits</Badge>
                                                            )}
                                                            {item.status==="failed" && (
                                                                <Badge variant={"destructive"}>Failed</Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {item.clipCount>0?(
                                                                <span>
                                                                    {item.clipCount} clip
                                                                    {item.clipCount!==1?"s":""}
                                                                </span>
                                                            ):(
                                                                <span className="text-muted-foreground">
                                                                    No Clips yet
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>

                                        </Table>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                {/* insert here tabcontent for another tab inn the same section */}
                <TabsContent value="my-clips">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Clips</CardTitle>
                            <CardDescription>
                                View and Manage your generate clips
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ClipDisplay clips={clips}/>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            
        </div>
    )
}
import {type Clip } from "@prisma/client"
import { Download, LoaderPinwheel, Play } from "lucide-react";
import {  useEffect, useState } from "react"
import {getClipPlayUrl} from "~/actions/generation"
import { Button } from "./ui/button";

function ClipCard({clip}:{clip:Clip}){
    const [playUrl,setPlayUrl]=useState<string|null>(null);
    const [isLoadingUrl,setIsLoadingUrl]=useState(true)
    // loading because we are contacting s3 bucket to get and download the video

    useEffect(()=>{
        // get the generated clops from the s3 bucket
        async function fetchPlayUrl(){
            setIsLoadingUrl(true)
            try{
                const result=await getClipPlayUrl(clip.id);
                if(result.success && result.url){
                    setPlayUrl(result.url)
                }else if(result.error){
                    console.error("Failed to get play Url: "+result.error)
                }
            }catch(error){
                console.error("Could not fetch the videos: ",error)
            }finally{
                setIsLoadingUrl(false)
            }
        }
        void fetchPlayUrl()
    },[clip.id])

    // donwload the clops
    const handleDownload=()=>{
        if(playUrl){
            const link=document.createElement("a");
            link.href=playUrl
            link.style.display="none"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    return (
        <div className="flex max-w-52 flex-col gap-2">
            <div className="">
                {isLoadingUrl?(
                    <div className="flex h-full items-center justify-center">
                        <LoaderPinwheel className="animate-spin text-muted-foreground h-12 w-12 "/>
                    </div>
                ): playUrl ?(
                    <video src={playUrl} controls preload="metadata" className="h-full w-full rounded-md object-cover"/>
                ) :(
                    <div className="flex h-full w-full items-center justify-center">
                        <Play className="text-muted-foreground h-10 w-10 opacity-50"/>
                    </div>
                )}
            </div>
            {/* download button */}
            <div className="flex flex-col gap-2">
                <Button 
                    onClick={handleDownload} 
                    variant={"default"} 
                    size="sm" 
                    className="cursor-pointer" hidden={isLoadingUrl} >
                    <Download className="mr-2 h-4 w-5"/>
                    Download
                </Button>
            </div>
        </div>
    )

}

export function ClipDisplay({clips}:{clips:Clip[]}){
    if(clips.length===0){
        return (
            <p className="text-muted-foreground p-4 text-center">
                No clips generated yey
            </p>
        )
    }

    

    return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {clips.map((clip)=>(
                <ClipCard key={clip.id} clip={clip}/>
            ))}
        </div>
    )
}
import { LoaderPinwheel  } from "lucide-react"

export default function Loading(){
    return (
        <div className="flex items-center justify-center p-12">
            <LoaderPinwheel  className="text-muted-foreground h-12 w-12 animate-spin"/>
        </div>
    )
}
import {hash,compare} from "bcryptjs";

export async function hashPassword(password:string){
    return (
        hash(password,12)
    )
}


export async function comparePassword(password:string,hashedPassword:string){
    return (
        compare(password,hashedPassword)
    )
}
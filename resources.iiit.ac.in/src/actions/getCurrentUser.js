import { authOptions } from "@/app/api/auth/[...nextauth]/AuthOptions";
import { getServerSession } from "next-auth";

export async function getSession(){
    return await getServerSession(authOptions);
}

export async function getCurrentUser(){
    try{
        const session = await getSession()

        if(!session?.user?.email){
            return null
        }
        const currentUser = await prisma.user.findUnique({
            where:{
                email: session?.user?.email,
            }
        })
        if(!currentUser){
            return null
        }
        return {
            ...currentUser
        }
    }
    catch(error){
        return null
    }
}
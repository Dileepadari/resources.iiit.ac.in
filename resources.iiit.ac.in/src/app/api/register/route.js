import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import prisma from '@/utils/connect';


export async function POST(req){
    try{
        const{name, email, password} = await req.json();
        console.log(name, email, password);
        const user_Exist = await await prisma.user.findUnique({
            where: {
                email: email
            }});

        if(user_Exist){
            return NextResponse.json({message: "User already Exist."}, {status: 500});
        }
        const hashPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({data:{name, email, password: hashPassword}})
        return NextResponse.json({message: "User Registered"}, {status: 200});
    }
    catch(error){
        console.log("Error while Registering.", error);
        return NextResponse.json({message: "Error Occured"}, {status: 400});
    }
}
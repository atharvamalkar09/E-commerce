import { Response } from "express";
import { AppDataSource } from "../data.source";
import { User } from "../entities/user";
import * as bcrypt from "bcrypt";



const userRepo = AppDataSource.getRepository(User);

export const editProfile = async(userId: number, data:{name?: string, email?:string})=>{
    
    await userRepo.update(userId,data);
    return await userRepo.findOneBy({id: userId});
}

export const changePassword = async(userId: number, oldpass: string, newpass:string)=>{

    const user = await userRepo.findOne({
        where: { id: userId },
        select: ["id", "passwordHash"] 
    });

    if(!user){
        throw new Error("User not Found");
    }

    const isMatch = await bcrypt.compare(oldpass, user.passwordHash);

    if(!isMatch){
        throw new Error("Current password is incorrect");
    }

    user.passwordHash = await bcrypt.hash(newpass,10);

    return userRepo.save(user);
}
import { AppDataSource } from "../data.source";
import { PasswordReset } from "../entities/passwordReset";
import { User } from "../entities/user";
import { sessionStore } from "../index"; 
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = "your_super_secret_key";

export const registerUser = async (userData: User): Promise<User> => { 

    const userRepository = AppDataSource.getRepository(User);

    const existingUser = await userRepository.findOneBy({ email: userData.email });


    if(existingUser){
        console.log("Email already registered");
        throw new Error("Email already present");
    }

    const hashedPassword = await bcrypt.hash(userData.passwordHash, 10);

    const user = userRepository.create({
        name: userData.name,
        email: userData.email,
        passwordHash: hashedPassword
    });
    
    return await userRepository.save(user);
};

export const validateLogin = async (email: string, password: any): Promise<any> => {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
        where: { email },
        select: ["id", "name", "email", "passwordHash", "role", "isLocked"]
    });


    if (!user) {      
        throw new Error("Invalid credentials!");
    }

    const passCompare   = (await bcrypt.compare(password, user!.passwordHash));

     if (!passCompare){
        throw new Error("Invalid credentials!");
     }

    if (user.isLocked) {
        throw new Error("Account is locked");
    }

    const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "1h" } 
    );

    sessionStore.set(token, { userId: user.id, role: user.role });

    return { token, user: { userId: user.id, role: user.role } };
};

const passwordResetRepo = AppDataSource.getRepository(PasswordReset);
const userRepo = AppDataSource.getRepository(User);

export const generateResetCode = async (email: string): Promise<string> => {
    const user = await userRepo.findOneBy({ email });

    if (!user) {
        throw new Error("User not found");
    }

    const tempCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const resetEntry = passwordResetRepo.create({
        tempCode,
        expiresAt,
        user
    });

    await passwordResetRepo.save(resetEntry);
    return tempCode;
};

export const resetPassword = async (email: string, code: string, newPassword: any) : Promise<boolean> => {
    const resetRequest = await passwordResetRepo.findOne({
        where: { tempCode: code, user: { email } },
        relations: ["user"]
    });

    if (!resetRequest) {
        throw new Error("Invalid code or email");
    }
    
    if (new Date() > resetRequest.expiresAt) {
        throw new Error("Code has expired");
    }

    const user = resetRequest.user;
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await userRepo.save(user);

    await passwordResetRepo.remove(resetRequest);
    return true;
};
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.generateResetCode = exports.validateLogin = exports.registerUser = void 0;
// src/services/auth.service.ts
const data_source_1 = require("../data.source");
const passwordReset_1 = require("../entities/passwordReset");
const user_1 = require("../entities/user");
const index_1 = require("../index");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = "your_super_secret_key";
const registerUser = async (userData) => {
    const userRepository = data_source_1.AppDataSource.getRepository(user_1.User);
    const existingUser = await userRepository.findOneBy({ email: userData.email });
    // if (existingUser) throw new Error("Email taken");
    if (existingUser) {
        console.log("Email already registered");
        throw new Error("Email already present");
    }
    const hashedPassword = await bcrypt_1.default.hash(userData.passwordHash, 10); // password
    const user = userRepository.create({
        name: userData.name,
        email: userData.email,
        passwordHash: hashedPassword
    });
    return await userRepository.save(user);
};
exports.registerUser = registerUser;
const validateLogin = async (email, password) => {
    const userRepository = data_source_1.AppDataSource.getRepository(user_1.User);
    const user = await userRepository.findOne({
        where: { email },
        select: ["id", "name", "email", "passwordHash", "role", "isLocked"]
    });
    if (!user) { // (await bcrypt.compare(password, user!.passwordHash))               // console
        throw new Error("Invalid credentials!");
    }
    const passCompare = (await bcrypt_1.default.compare(password, user.passwordHash));
    if (!passCompare) {
        throw new Error("Invalid credentials!");
    }
    if (user.isLocked) {
        throw new Error("Account is locked");
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
    index_1.sessionStore.set(token, { userId: user.id, role: user.role });
    return { token, user: { userId: user.id, role: user.role } };
};
exports.validateLogin = validateLogin;
const passwordResetRepo = data_source_1.AppDataSource.getRepository(passwordReset_1.PasswordReset);
const userRepo = data_source_1.AppDataSource.getRepository(user_1.User);
const generateResetCode = async (email) => {
    const user = await userRepo.findOneBy({ email });
    if (!user)
        throw new Error("User not found");
    const tempCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    const resetEntry = passwordResetRepo.create({
        tempCode,
        expiresAt,
        user
    });
    await passwordResetRepo.save(resetEntry);
    return tempCode; // Return to controller to display "on screen"
};
exports.generateResetCode = generateResetCode;
const resetPassword = async (email, code, newPassword) => {
    const resetRequest = await passwordResetRepo.findOne({
        where: { tempCode: code, user: { email } },
        relations: ["user"]
    });
    if (!resetRequest)
        throw new Error("Invalid code or email");
    // Requirement 5.5: Check expiry
    if (new Date() > resetRequest.expiresAt) {
        throw new Error("Code has expired");
    }
    // Update user password
    const user = resetRequest.user;
    user.passwordHash = await bcrypt_1.default.hash(newPassword, 10);
    await userRepo.save(user);
    // Clean up: delete the used reset code
    await passwordResetRepo.remove(resetRequest);
    return true;
};
exports.resetPassword = resetPassword;

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.editProfile = void 0;
const data_source_1 = require("../data.source");
const user_1 = require("../entities/user");
const bcrypt = __importStar(require("bcrypt"));
const userRepo = data_source_1.AppDataSource.getRepository(user_1.User);
const editProfile = async (userId, data) => {
    await userRepo.update(userId, data);
    return await userRepo.findOneBy({ id: userId });
};
exports.editProfile = editProfile;
const changePassword = async (userId, oldpass, newpass) => {
    const user = await userRepo.findOne({
        where: { id: userId },
        select: ["id", "passwordHash"]
    });
    if (!user) {
        throw new Error("User not Found");
    }
    const isMatch = await bcrypt.compare(oldpass, user.passwordHash);
    if (!isMatch) {
        throw new Error("Current password is incorrect");
    }
    user.passwordHash = await bcrypt.hash(newpass, 10);
    return userRepo.save(user);
};
exports.changePassword = changePassword;

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "./user";


@Entity()
export class PasswordReset {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    tempCode!: string; 

    @Column()
    expiresAt!: Date;

    @CreateDateColumn()
    createdAt!: Date;

    @ManyToOne(() => User)
    user!: User;
}
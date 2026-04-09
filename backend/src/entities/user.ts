import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Order } from "./order";


@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ unique: true })
    email!: string;

    @Column({ select: false }) 
    passwordHash!: string;

    @Column({ default: 'customer' }) 
    role!: string;

    @Column({ default: false }) 
    isLocked!: boolean;

    @OneToMany(() => Order, (order) => order.user)
    orders!: Order[];
}
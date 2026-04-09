import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from "typeorm";
import { User } from "./user";
import { OrderItem } from "./orderItem";


@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id!: number;

    @CreateDateColumn()
    orderDate!: Date;

    @Column()
    paymentMethod!: string;

    @Column("decimal", { precision: 10, scale: 2 })
    totalAmount!: number;

    @Column({type: "varchar", default: "Pending"})
    status!:string;

    @ManyToOne(() => User, (user) => user.orders)
    user!: User;

    @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
    items!: OrderItem[];
}
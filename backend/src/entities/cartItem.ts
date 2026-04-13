import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./user";
import { Product } from "./product";

@Entity()
export class CartItem {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    quantity!: number;

    @ManyToOne(() => User)
    user!: User;

    @ManyToOne(() => Product, { onDelete: 'CASCADE' })
    product!: Product;
}
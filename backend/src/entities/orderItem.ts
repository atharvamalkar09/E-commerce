import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Order } from "./order";
import { Product } from "./product";


@Entity()
export class OrderItem {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    quantity!: number;

    @Column("decimal", { precision: 10, scale: 2 })
    priceAtPurchase!: number;

    @ManyToOne(() => Order, (order) => order.items)
    order!: Order;

    @ManyToOne(() => Product,{ onDelete: 'CASCADE' })
    product!: Product;
}
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { SubCategory } from "./subcategory";


@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column("text")
    description!: string;

    @Column("decimal", { precision: 10, scale: 2 })
    price!: number;

    @Column()
    stockQuantity!: number;

    @Column({ nullable: true })
    imagePath!: string; 

    @ManyToOne(() => SubCategory, (subCat) => subCat.products, {onDelete:'CASCADE'})
    subCategory!: SubCategory;
}
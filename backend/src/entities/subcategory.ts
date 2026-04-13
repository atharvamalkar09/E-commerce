import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "./category";
import { Product } from "./product";


@Entity()
export class SubCategory{

    @PrimaryGeneratedColumn()
    id!:number;

    @Column()
    name!:string;

    @ManyToOne(() => Category, (cat) => cat.subCategories, { 
    onDelete: 'CASCADE' })
    category!: Category;

    @OneToMany(() => Product, (product) => product.subCategory)
    products!: Product[];
}
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { SubCategory } from "./subcategory";
import { Type } from "./type";





@Entity()
export class Category{

    @PrimaryGeneratedColumn()
    id!:number;

    @Column()
    name!:string;

    @ManyToOne(() => Type, (type) => type.categories, { 
    onDelete: 'CASCADE' })
    type!: Type;

    @OneToMany(()=> SubCategory, (subcategory)=> subcategory.category)
    subCategories!:SubCategory[];
}
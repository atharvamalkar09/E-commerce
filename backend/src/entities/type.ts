import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "./category";


@Entity()
export class Type{

    @PrimaryGeneratedColumn()
    id!:number;

    @Column()
    name!:string;

    @OneToMany(() => Category, (category) => category.type)
    categories!: Category[];

}
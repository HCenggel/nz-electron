import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';

@Entity()
export class Tasks {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({type: 'text', comment: '任务名称'})
    name!: string;

    @Column({type: 'text', comment: '详细描述'})
    description!: string;

    @Column({default: false, comment: '任务完成状态'})
    completed!: boolean;

    @Column({default: false})
    isDeleted!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import User from "./User";

@Entity()
export default class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  fromUserId: number;
  @ManyToOne(() => User, (user) => user.sentMessages)
  @JoinColumn({ name: "fromUserId" })
  fromUser: User;

  @Column()
  toUserId: number;
  @ManyToOne(() => User, (user) => user.receivedMessages)
  @JoinColumn({ name: "toUserId" })
  toUser: User;
}

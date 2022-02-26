import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  Unique,
  OneToMany,
} from "typeorm";
import Message from "./Message";

@Entity()
@Unique(["username"])
export default class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ select: false })
  password: string;

  @OneToMany(() => Message, (message) => message.fromUser)
  sentMessages: Message[];

  @OneToMany(() => Message, (message) => message.toUser)
  receivedMessages: Message[];
}

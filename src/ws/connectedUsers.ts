import User from "../entities/User";
import { Socket } from "socket.io";
import Debug from "debug";

class ConnectedUsers {
  private users: Record<
    string,
    {
      user: User;
      socket: Socket;
    }
  >;

  constructor() {
    this.users = {};
  }

  private debug = Debug("connectedUsers");

  async addUser(socket: Socket, user: User) {
    this.users[socket.id] = { socket, user };

    this.debug(`user added: ${user.username}`);
  }

  async removeUser(socketId: number) {
    this.debug(`user removed: ${this.users[socketId].user.username}`);

    this.users[socketId] = undefined;
  }

  getUser(socketId: number) {
    return this.users[socketId];
  }
}

const connectedUsers = new ConnectedUsers();

export default connectedUsers;

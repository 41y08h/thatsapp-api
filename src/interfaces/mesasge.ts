export enum IMessageType {
  TEXT = 0,
  IMAGE,
  VIDEO,
}
export interface IMessage {
  id?: number;
  text: string;
  sender: string;
  receiver: string;
  message_type: IMessageType;
  media_type: string;
  remote_media_url?: string;
  local_media_filename?: string;
  media_size?: number;
  created_at?: string;
  delivered_at?: string;
  read_at?: string;
}

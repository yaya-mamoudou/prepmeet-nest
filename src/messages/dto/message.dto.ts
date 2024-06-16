import { IsEnum, IsNotEmpty } from 'class-validator';

export class SendMessageDto {
  @IsNotEmpty()
  conversationId: number;

  @IsNotEmpty()
  receiverId: number;

  @IsNotEmpty()
  message: string;
}

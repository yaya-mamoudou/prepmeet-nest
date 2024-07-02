import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreateConversationDto {
  @IsNotEmpty()
  initiatorWithUserId: number;
}

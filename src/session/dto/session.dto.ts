import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreateSessionDto {
  @IsNotEmpty()
  expertId: number;

  @IsNotEmpty()
  pricingUrl: string;

  @IsNotEmpty()
  sessionType: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  duration: number;

  @IsNotEmpty()
  startTime: Date;

  @IsNotEmpty()
  endTime: Date;

  @IsNotEmpty()
  numberOfSlots: number;
}

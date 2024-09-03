import { IsEnum, IsNotEmpty } from 'class-validator';
import { Slots } from 'src/utils/types';

export class CreateSessionDto {
  @IsNotEmpty()
  expertId: number;

  @IsNotEmpty()
  pricingUrl: string;

  @IsNotEmpty()
  sessionType: string;

  @IsNotEmpty()
  description: string;

  // @IsNotEmpty()
  // duration: number;

  // @IsNotEmpty()
  // startTime: Date;

  @IsNotEmpty()
  slot: Slots[];

  // @IsNotEmpty()
  // numberOfSlots: number;
}

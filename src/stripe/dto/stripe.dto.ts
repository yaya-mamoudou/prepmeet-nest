import { IsNotEmpty } from 'class-validator';

export class CreatePriceDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  amountInCent: number;
}

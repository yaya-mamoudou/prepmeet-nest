import { IsEnum, IsNotEmptyObject } from 'class-validator';
import { VisibilityLevel } from 'src/utils/enum';

export class UpdateExpertProfileDto {
  about: string;

  videoUrl: string;
  @IsEnum(VisibilityLevel)
  visibilityLevel: VisibilityLevel;
}

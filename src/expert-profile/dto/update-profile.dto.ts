import { IsEnum, IsNotEmpty } from 'class-validator';
import { VisibilityLevel } from 'src/utils/enum';

export class UpdateExpertProfileDto {
  about: string;

  videoUrl: string;
  @IsEnum(VisibilityLevel)
  visibilityLevel: VisibilityLevel;
  focusAreaId: number;
}

export class AddEducationExperienceDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  year: string;

  @IsNotEmpty()
  degreeId: number;
}

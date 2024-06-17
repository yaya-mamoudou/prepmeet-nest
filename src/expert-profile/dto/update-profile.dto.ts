import { IsEnum, IsNotEmpty } from 'class-validator';
import { VisibilityLevel } from 'src/utils/enum';

export class UpdateExpertProfileDto {
  about: string;
  videoUrl: string;
  @IsEnum(VisibilityLevel)
  visibilityLevel: VisibilityLevel;
  focusAreaId: number;
  starterPrice: number;
  recommendedPrice: number;
  bestPrice: number;
}

export class AddEducationExperienceDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  year: string;

  @IsNotEmpty()
  degreeId: number;
}

export class updateEducationExperienceDto {
  name: string;

  year: string;

  degreeId: number;
}

export class AddCertificationDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  year: string;

  @IsNotEmpty()
  certificationUrl: number;
}

export class updateCertificationDto {
  name: string;

  year: string;

  certificationUrl: number;
}

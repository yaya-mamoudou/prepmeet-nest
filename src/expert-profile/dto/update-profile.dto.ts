import { IsEmpty, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { Gender, VisibilityLevel } from 'src/utils/enum';
import { Slots } from 'src/utils/types';

export class UpdateProfileDto {
  about: string;
  videoUrl: string;
  @IsOptional()
  @IsEnum(VisibilityLevel)
  visibilityLevel: VisibilityLevel;
  focusAreaId: number;
  starterPrice: number;
  recommendedPrice: number;
  bestPrice: number;
  firstName: string;
  lastName: string;
  country: string;
  location: string;
  gender: Gender;
  profilePhoto: string;
  dateOfBirth: Date;
  phoneNumber: string;
}

export class updateExpertAvailabilityDto {
  @IsNotEmpty()
  day: string;
  @IsNotEmpty()
  slot: Slots[];
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

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpertProfile } from './entities/expert-profile.entity';
import {
  AddEducationExperienceDto,
  UpdateExpertProfileDto,
} from './dto/update-profile.dto';
import { FocusArea } from './entities/focus-area.entity';
import { EducationalExperience } from './entities/educational-experience.entity';
import { Degrees } from './entities/degrees.entity';

@Injectable()
export class ExpertProfileService {
  constructor(
    @InjectRepository(ExpertProfile)
    private expertProfileRepo: Repository<ExpertProfile>,
    @InjectRepository(FocusArea)
    private focusArea: Repository<FocusArea>,
    @InjectRepository(EducationalExperience)
    private educationalExperience: Repository<EducationalExperience>,
    @InjectRepository(Degrees)
    private degrees: Repository<Degrees>,
  ) {}

  async getExpertProfile(id: number) {
    return await this.expertProfileRepo.findOneBy({
      userId: id,
    });
  }

  async getExpertProfileById(id: number) {
    return await this.expertProfileRepo.find({
      where: {
        userId: Number(id),
      },
      relations: {
        focusArea: true,
      },
    });
  }

  async updateExpertProfile(id: number, profileInfo: UpdateExpertProfileDto) {
    let userInfo = await this.expertProfileRepo.findOneBy({ userId: id });
    if (profileInfo.focusAreaId) {
      const getFocusArea = await this.focusArea.findOneBy({
        id: profileInfo.focusAreaId,
      });
      if (!getFocusArea) {
        throw new HttpException(`Focus Area not found`, HttpStatus.NOT_FOUND);
      }
    }

    if (!userInfo) {
      return await this.expertProfileRepo.save({
        ...profileInfo,
        userId: id,
        createdDate: new Date(),
        updatedDate: new Date(),
      });
    }

    return await this.expertProfileRepo.update(userInfo.id, profileInfo);
  }

  async addEducationalExperience(
    id: number,
    educationExp: AddEducationExperienceDto[],
  ) {
    for (let i = 0; i < educationExp.length; i++) {
      const degree = await this.degrees.findOneBy({
        id: educationExp[i].degreeId,
      });
      if (!degree) {
        throw new HttpException(
          `Degree ${educationExp[i].degreeId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      await this.educationalExperience.save({
        ...educationExp[i],
        userId: id,
      });
    }
  }

  async getExpertsEducationById(id: number) {
    return await this.educationalExperience.find({
      where: {
        userId: Number(id),
      },
      relations: {
        degree: true,
      },
    });
  }

  async deleteEducationById(expertId: number, educationalExpId: number) {
    return await this.educationalExperience.delete({
      userId: expertId,
      id: Number(educationalExpId),
    });
  }
}

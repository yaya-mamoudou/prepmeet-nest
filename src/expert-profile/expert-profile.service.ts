import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpertProfile } from './entities/expert-profile.entity';
import {
  AddCertificationDto,
  AddEducationExperienceDto,
  UpdateExpertProfileDto,
  updateCertificationDto,
  updateEducationExperienceDto,
} from './dto/update-profile.dto';
import { FocusArea } from './entities/focus-area.entity';
import { EducationalExperience } from './entities/educational-experience.entity';
import { Degrees } from './entities/degrees.entity';
import { Certificate } from 'crypto';
import { Certification } from './entities/certification.entity';

@Injectable()
export class ExpertProfileService {
  constructor(
    @InjectRepository(ExpertProfile)
    private expertProfileRepo: Repository<ExpertProfile>,
    @InjectRepository(FocusArea)
    private focusArea: Repository<FocusArea>,
    @InjectRepository(EducationalExperience)
    private educationalExperienceRepoRepo: Repository<EducationalExperience>,
    @InjectRepository(Degrees)
    private degreesRepo: Repository<Degrees>,
    @InjectRepository(Certification)
    private certificateRepo: Repository<Certification>,
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

  async addCertification(id: number, certifications: any[]) {
    for (let i = 0; i < certifications.length; i++) {
      await this.certificateRepo.save({
        ...certifications[i],
        userId: id,
      });
    }
    return 'done';
  }

  async getCertificationById(id: number) {
    return await this.certificateRepo.find({
      where: {
        userId: Number(id),
      },
    });
  }

  async deleteCertificationById(expertId: number, certificationId: number) {
    return await this.certificateRepo.delete({
      userId: expertId,
      id: Number(certificationId),
    });
  }

  async updateCertificationById(
    expertId: number,
    certificationId: number,
    body: any,
  ) {
    const cert = await this.certificateRepo.findOneBy({
      id: certificationId,
    });
    if (cert.userId !== expertId) {
      throw new HttpException(
        `Ensure you are the creator of this asset and try again`,
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.certificateRepo.update(certificationId, body);
  }

  async addEducationalExperience(
    id: number,
    educationExp: AddEducationExperienceDto[],
  ) {
    for (let i = 0; i < educationExp.length; i++) {
      const degree = await this.degreesRepo.findOneBy({
        id: educationExp[i].degreeId,
      });
      if (!degree) {
        throw new HttpException(
          `Degree ${educationExp[i].degreeId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      await this.educationalExperienceRepoRepo.save({
        ...educationExp[i],
        userId: id,
      });
    }
    return 'done';
  }

  async getExpertsEducationById(id: number) {
    return await this.educationalExperienceRepoRepo.find({
      where: {
        userId: Number(id),
      },
      relations: {
        degree: true,
      },
    });
  }

  async deleteEducationById(expertId: number, educationalExpId: number) {
    return await this.educationalExperienceRepoRepo.delete({
      userId: expertId,
      id: Number(educationalExpId),
    });
  }

  async updateEducationById(
    expertId: number,
    educationalExpId: number,
    body: updateEducationExperienceDto,
  ) {
    const educationExp = await this.educationalExperienceRepoRepo.findOneBy({
      id: educationalExpId,
    });
    if (educationExp.userId !== expertId) {
      throw new HttpException(
        `Ensure you are the creator of this asset and try again`,
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.educationalExperienceRepoRepo.update(
      educationalExpId,
      body,
    );
  }
}

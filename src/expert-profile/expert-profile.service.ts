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
  updateExpertAvailabilityDto,
} from './dto/update-profile.dto';
import { FocusArea } from './entities/focus-area.entity';
import { EducationalExperience } from './entities/educational-experience.entity';
import { Degrees } from './entities/degrees.entity';
import { Certificate } from 'crypto';
import { Certification } from './entities/certification.entity';
import { StripeService } from 'src/stripe/stripe.service';
import { Availability } from 'src/session/entities/availability';
import { DaysArray } from 'src/utils/types';
import { AuthService } from 'src/auth/auth.service';
import { UserRole } from 'src/utils/enum';

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
    private stripeService: StripeService,
    @InjectRepository(Availability)
    private availabilityRepo: Repository<Availability>,
    private readonly authService: AuthService,
  ) {}

  async getExpertProfile(id: number) {
    return await this.expertProfileRepo.findOneBy({
      userId: id,
    });
  }

  async getExpertProfileById(id: number) {
    const availability = await this.getExpertAvailability(Number(id));
    const certificate = await this.getCertificationById(Number(id));
    const education = await this.getExpertsEducationById(Number(id));

    const profileInfo = await this.expertProfileRepo.findOne({
      where: {
        userId: Number(id),
      },
      relations: {
        focusArea: true,
      },
    });

    return { profileInfo, certificate, availability, education };
  }

  async getAllExperts() {
    return await this.authService.getAllUserByRole(UserRole.expert);
  }

  async updateExpertProfile(id: number, profileInfo: UpdateExpertProfileDto) {
    let userInfo = await this.expertProfileRepo.findOne({
      where: {
        userId: id,
      },
    });

    if (profileInfo.focusAreaId) {
      const getFocusArea = await this.focusArea.findOneBy({
        id: profileInfo.focusAreaId,
      });
      if (!getFocusArea) {
        throw new HttpException(`Focus Area not found`, HttpStatus.NOT_FOUND);
      }
    }

    if (!userInfo) {
      let starterPriceUrl;
      if (profileInfo.starterPrice) {
        starterPriceUrl = await this.stripeService.createPrice(
          'Payment plan',
          profileInfo.starterPrice * 100,
        );
      }

      let bestPriceUrl;
      if (profileInfo.bestPrice) {
        bestPriceUrl = await this.stripeService.createPrice(
          'Payment plan',
          profileInfo.bestPrice * 100,
        );
      }

      let recommendedPriceUrl;
      if (profileInfo.recommendedPrice) {
        recommendedPriceUrl = await this.stripeService.createPrice(
          'Payment plan',
          profileInfo.recommendedPrice * 100,
        );
      }
      return await this.expertProfileRepo.save({
        ...profileInfo,
        userId: id,
        starterPriceUrl: starterPriceUrl && starterPriceUrl,
        bestPriceUrl: bestPriceUrl && bestPriceUrl,
        recommendedPriceUrl: recommendedPriceUrl && recommendedPriceUrl,
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

  async updateAvailability(
    expertId: number,
    body: updateExpertAvailabilityDto,
  ) {
    if (!DaysArray?.includes(body.day)) {
      throw new HttpException(
        `Ensure the day format is correct`,
        HttpStatus.BAD_REQUEST,
      );
    }
    for (let i = 0; i < body.slot.length; i++) {
      console.table(body.slot[i]);
      console.log('table');

      if (
        !body.slot[i].from ||
        !body.slot[i].to ||
        (body.slot[i].availability !== 'AVAILABLE' &&
          body.slot[i].availability !== 'NOT_AVAILABLE')
      ) {
        continue;
      }

      if (!body.slot[i].slotId) {
        const data = await this.availabilityRepo.save({
          expertId: expertId,
          slot: {
            from: body.slot[i].from,
            to: body.slot[i].to,
            availability: body.slot[i].availability,
          },
          day: body.day,
        });

        continue;
      }

      const slot = await this.getSlotById(body?.slot?.[i]?.slotId);
      if (!slot) {
        continue;
        // throw new HttpException(`Invalid slot id`, HttpStatus.BAD_REQUEST);
      }
      await this.removeSlotById(body.slot[i].slotId);
    }
    return 'Update completed';
  }

  async getSlotById(id: number) {
    return this.availabilityRepo.findOneBy({ id: id });
  }

  async getSlotBySlotAndDay(day: string, from: string, to: string) {
    return this.availabilityRepo
      .createQueryBuilder('availability')
      .where('availability.day = :day', { day })
      .andWhere('JSON_EXTRACT(availability.slot, "$.from") = :from', { from })
      .andWhere('JSON_EXTRACT(availability.slot, "$.to") = :to', { to })
      .getOne();
  }

  async removeSlotById(id: number) {
    return this.availabilityRepo.delete({ id: id });
  }

  async getExpertAvailability(expertId: number) {
    return this.availabilityRepo.find({
      where: {
        expertId: expertId,
      },
    });
  }

  async getFocusArea() {
    return this.focusArea.find();
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpertProfile } from './entities/expert-profile.entity';
import { UpdateExpertProfileDto } from './dto/update-profile.dto';
import { VisibilityLevel } from 'src/utils/enum';

@Injectable()
export class ExpertProfileService {
  constructor(
    @InjectRepository(ExpertProfile)
    private expertProfileRepo: Repository<ExpertProfile>,
  ) {}

  async updateExpertProfile(id: number, profileInfo: UpdateExpertProfileDto) {
    let userInfo = await this.expertProfileRepo.findOneBy({ userId: id });
    if (!userInfo) {
      return await this.expertProfileRepo.save({
        ...profileInfo,
        userId: id,
        createdDate: new Date(),
        updatedDate: new Date(),
      });
    }

    // if (profileInfo?.visibilityLevel) {
    //   // if([visibilityLevel.basicVisible,visibilityLevel.basicVisible])
    // }
    return await this.expertProfileRepo.update(userInfo.id, profileInfo);
  }
}

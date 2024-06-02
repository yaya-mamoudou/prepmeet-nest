import {
  Body,
  Controller,
  Patch,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ExpertProfileService } from './expert-profile.service';
import { AuthGuard } from '@nestjs/passport';
import { ExpertProfileUpdateExample } from 'src/auth/examples/profile';
import { UpdateExpertProfileDto } from './dto/update-profile.dto';

@Controller('expert-profile')
@ApiTags('Expert Profile')
export class ExpertProfileController {
  constructor(private readonly expertProfileService: ExpertProfileService) {}

  @Patch('')
  @UseGuards(AuthGuard('jwt'))
  @UseGuards(AuthGuard('expert-role'))
  @UsePipes(ValidationPipe)
  @ApiBody({
    type: UpdateExpertProfileDto,
    examples: {
      ExpertProfileUpdateExample: {
        value: ExpertProfileUpdateExample,
      },
    },
  })
  updateExpertProfile(
    @Request() req: any,
    @Body() profileInfo: UpdateExpertProfileDto,
  ) {
    const user = req.user;

    return this.expertProfileService.updateExpertProfile(user.uid, profileInfo);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExpertProfileService } from './expert-profile.service';
import { AuthGuard } from '@nestjs/passport';
import {
  ExpertProfileUpdateExample,
  addEducationalExperience,
} from 'src/auth/examples/profile';
import {
  AddEducationExperienceDto,
  UpdateExpertProfileDto,
} from './dto/update-profile.dto';

@Controller('expert-profile')
@ApiTags('Expert Profile')
export class ExpertProfileController {
  constructor(private readonly expertProfileService: ExpertProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get currently signed in expert profile' })
  @UseGuards(AuthGuard('jwt'))
  getExpertProfile(@Request() req: any) {
    const user = req.user;
    return this.expertProfileService.getExpertProfile(user.uid);
  }

  @Get('/:expertId')
  @ApiOperation({ summary: 'Get expert profile by ID' })
  @UseGuards(AuthGuard('jwt'))
  getExpertProfileById(@Param('expertId') expertId: number) {
    return this.expertProfileService.getExpertProfileById(expertId);
  }

  @Patch('')
  @ApiOperation({ summary: 'Update expert profile' })
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

  @Post('/educational-experience')
  @ApiOperation({ summary: 'Add educational experience' })
  @UseGuards(AuthGuard('jwt'))
  @UseGuards(AuthGuard('expert-role'))
  @UsePipes(ValidationPipe)
  @ApiBody({
    type: AddEducationExperienceDto,
    examples: {
      ExpertProfileUpdateExample: {
        value: addEducationalExperience,
      },
    },
  })
  addEducationalExp(
    @Request() req: any,
    @Body()
    body: {
      eduExp: AddEducationExperienceDto[];
    },
  ) {
    const user = req.user;
    return this.expertProfileService.addEducationalExperience(
      user.uid,
      body.eduExp,
    );
  }

  @Get('/:expertId/educational-experience')
  @ApiOperation({ summary: 'Get an experts educational experience' })
  @UseGuards(AuthGuard('jwt'))
  getExpertsEducationById(@Param('expertId') expertId: number) {
    return this.expertProfileService.getExpertsEducationById(expertId);
  }

  @Delete('/educational-experience/:educationId')
  @ApiOperation({ summary: 'Delete a specific educational experience by id' })
  @UseGuards(AuthGuard('jwt'))
  @UseGuards(AuthGuard('expert-role'))
  deleteEducationById(
    @Param('educationId') educationId: number,
    @Request() req: any,
  ) {
    const user = req.user;
    return this.expertProfileService.deleteEducationById(user.uid, educationId);
  }
}

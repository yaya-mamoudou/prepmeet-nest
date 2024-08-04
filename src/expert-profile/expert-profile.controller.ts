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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExpertProfileService } from './expert-profile.service';
import { AuthGuard } from '@nestjs/passport';
import {
  ExpertAvailabilityExample,
  ExpertProfileUpdateExample,
  addCertification,
  addEducationalExperience,
} from 'src/auth/examples/profile';
import {
  AddCertificationDto,
  AddEducationExperienceDto,
  UpdateExpertProfileDto,
  updateCertificationDto,
  updateExpertAvailabilityDto,
} from './dto/update-profile.dto';

@Controller('expert')
@ApiBearerAuth()
@ApiTags('Expert')
export class ExpertProfileController {
  constructor(private readonly expertProfileService: ExpertProfileService) { }

  @Get()
  @ApiOperation({ summary: 'Get currently signed in expert profile' })
  @UseGuards(AuthGuard('jwt'))
  getExpertProfile(@Request() req: any) {
    const user = req.user;
    return this.expertProfileService.getExpertProfile(user.uid);
  }


  @Get("/list")
  @ApiOperation({ summary: 'Get list of experts' })
  // @UseGuards(AuthGuard('jwt'))
  getAll(@Request() req: any) {
    const user = req.user;
    return this.expertProfileService.getAllExperts();
  }

  @Get('/:expertId')
  @ApiOperation({ summary: 'Get expert profile by ID' })
  // @UseGuards(AuthGuard('jwt'))
  getExpertProfileById(@Param('expertId') expertId: number) {
    return this.expertProfileService.getExpertProfileById(expertId);
  }

  @Patch('')
  @ApiOperation({ summary: 'Update current expert profile' })
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

  @Patch('/educational-experience/:educationId')
  @ApiOperation({ summary: 'Update a specific educational experience by id' })
  @UseGuards(AuthGuard('jwt'))
  @UseGuards(AuthGuard('expert-role'))
  @ApiBody({
    type: AddEducationExperienceDto,
    examples: {
      ExpertProfileUpdateExample: {
        value: addEducationalExperience,
      },
    },
  })
  updateEducationById(
    @Param('educationId') educationId: number,
    @Request() req: any,
    @Body() body: any,
  ) {
    const user = req.user;
    return this.expertProfileService.updateEducationById(
      user.uid,
      educationId,
      body,
    );
  }

  @Post('/certification')
  @ApiOperation({ summary: 'Add new certification' })
  @UseGuards(AuthGuard('jwt'))
  @UseGuards(AuthGuard('expert-role'))
  @UsePipes(ValidationPipe)
  @ApiBody({
    type: AddCertificationDto,
    examples: {
      ExpertProfileUpdateExample: {
        value: addCertification,
      },
    },
  })
  addCertificationExp(
    @Request() req: any,
    @Body()
    body: {
      certifications: AddCertificationDto[];
    },
  ) {
    const user = req.user;
    return this.expertProfileService.addCertification(
      user.uid,
      body.certifications,
    );
  }

  @Get('/:expertId/certification')
  @ApiOperation({ summary: 'Get an experts certification' })
  @UseGuards(AuthGuard('jwt'))
  getCertificationById(@Param('expertId') expertId: number) {
    return this.expertProfileService.getCertificationById(expertId);
  }

  @Delete('/certification/:certificationId')
  @ApiOperation({ summary: 'Delete a specific certification by id' })
  @UseGuards(AuthGuard('jwt'))
  @UseGuards(AuthGuard('expert-role'))
  deleteCertificationById(
    @Param('certificationId') certificationId: number,
    @Request() req: any,
  ) {
    const user = req.user;
    return this.expertProfileService.deleteCertificationById(
      user.uid,
      certificationId,
    );
  }

  @Patch('/certification/:certificationId')
  @ApiOperation({ summary: 'Update a specific certification by id' })
  @UseGuards(AuthGuard('jwt'))
  @UseGuards(AuthGuard('expert-role'))
  @ApiBody({
    type: updateCertificationDto,
    examples: {
      ExpertProfileUpdateExample: {
        value: addCertification,
      },
    },
  })
  updateCertificationById(
    @Param('certificationId') certificationId: number,
    @Request() req: any,
    @Body() body: any,
  ) {
    const user = req.user;
    return this.expertProfileService.updateCertificationById(
      user.uid,
      certificationId,
      body,
    );
  }

  @Patch('update-availability')
  @UsePipes(ValidationPipe)
  @ApiBody({
    type: updateExpertAvailabilityDto,
    examples: {
      ExpertProfileUpdateExample: {
        value: ExpertAvailabilityExample,
      },
    },
  })
  @ApiOperation({ summary: 'Update availability' })
  @UseGuards(AuthGuard('jwt'))
  @UseGuards(AuthGuard('expert-role'))
  updateExpertAvailability(
    @Request() req: any,
    @Body() profileInfo: updateExpertAvailabilityDto,
  ) {
    const user = req.user;
    return this.expertProfileService.updateAvailability(user.uid, profileInfo);
  }
}

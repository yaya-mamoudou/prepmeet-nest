import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateReviewDto } from './dto/review.dto';
import { LeaveReview } from 'src/auth/examples/review';

@Controller('review')
@ApiBearerAuth()
@ApiTags('Review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('/expert/:expertId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all reviews for an expert' })
  getReviewsByExpertId(@Param('expertId') expertId: number) {
    return this.reviewService.getAllExpertReviews(expertId);
  }

  @Post('/leave-review')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'leave review for expert' })
  @ApiBody({
    type: CreateReviewDto,
    examples: {
      review: {
        value: LeaveReview,
      },
    },
  })
  leaveReview(@Request() req: any, @Body() body: CreateReviewDto) {
    const user = req.user;
    return this.reviewService.leaveReview(body, user);
  }

  @Delete('/:reviewId')
  @ApiOperation({ summary: 'Delete a specific review id' })
  @UseGuards(AuthGuard('jwt'))
  deleteEducationById(
    @Param('reviewId') reviewId: number,
    @Request() req: any,
  ) {
    const user = req.user;
    return this.reviewService.deleteReview(reviewId, user);
  }
}

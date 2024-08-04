import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { JwtContent } from 'src/utils/types';
import { CreateReviewDto } from './dto/review.dto';
import { UserRole } from 'src/utils/enum';

@Injectable()
export class ReviewService {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
  ) {}

  async leaveReview(body: CreateReviewDto, user: JwtContent) {
    const expert = await this.authService.getUserById(body.expertId);
    if (!expert) {
      throw new HttpException(
        `No expert found with this id`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (expert.role !== UserRole.expert) {
      throw new HttpException(
        `You can only leave a review for an expert`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!body.rating && !body.message) {
      throw new HttpException(
        `Ensure to add either a rating or a review message`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.reviewRepo.save({
      message: body?.message,
      rating: body?.rating,
      reviewerId: user.uid,
      expertId: expert.id,
      createdDate: new Date(),
      updatedDate: new Date(),
    });
  }

  async deleteReview(reviewId: number, user: JwtContent) {
    const review = await this.getReviewById(reviewId);
    if (!review) {
      throw new HttpException(
        `No review found with this id`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (user.uid !== review.reviewerId) {
      throw new HttpException(
        `Ensure you are the author of this review`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.reviewRepo.delete(review.id);
  }

  async getReviewById(id: number) {
    return this.reviewRepo.findOne({
      where: {
        id: id,
      },
    });
  }

  async getAllExpertReviews(expertId: number) {
    const reviews = await this.reviewRepo.find({
      where: {
        expertId: expertId,
      },
    });
    let total = 0;
    for (let i = 0; i < reviews.length; i++) {
      total += reviews[i]?.rating;
    }
    return {
      overallRatings: (total / reviews?.length).toFixed(2),
      reviews,
    };
  }
}

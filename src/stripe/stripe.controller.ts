import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreatePriceDto } from './dto/stripe.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('stripe')
@ApiBearerAuth()
@ApiTags('Stripe payment')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  @Get('products')
  @ApiOperation({
    summary: 'Get all products created',
  })
  async getProducts() {
    return await this.stripeService.getProducts();
  }

  @Get('customers')
  @ApiOperation({
    summary: 'Get all customers',
  })
  async getCustomers() {
    return await this.stripeService.getProducts();
  }

  @Post()
  @ApiOperation({
    summary: 'Create pricing scheme',
  })
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard('jwt'))
  async createPrice(@Body() body: CreatePriceDto) {
    return this.stripeService.createPrice(body.title, body.amountInCent);
  }

  @Get('get-payment-status/:stripeSessionId')
  @ApiOperation({
    summary: 'Get payment status',
  })
  async getSession(@Param('stripeSessionId') stripeSessionId: string) {
    return await this.stripeService.getSession(stripeSessionId);
  }

  @Get('expire-status/:stripeSessionId')
  @ApiOperation({
    summary: 'Expire payment status',
  })
  async expireSession(@Param('stripeSessionId') stripeSessionId: string) {
    return await this.stripeService.expireSession(stripeSessionId);
  }
}

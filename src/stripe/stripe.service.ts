import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SessionStatus } from 'src/utils/enum';
import { delay } from 'src/utils/util';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(@Inject('STRIPE_API_KEY') private readonly apiKey: string) {
    this.stripe = new Stripe(this.apiKey, {
      apiVersion: '2024-04-10',
    });
  }

  async getProducts(): Promise<Stripe.Product[]> {
    const products = await this.stripe.products.list();
    return products.data;
  }

  async getCustomers() {
    const customers = await this.stripe.customers.list({});
    return customers.data;
  }

  async createCheckoutSession(pricingUrl: string, quantity: number) {
    const checkoutSession = await this.stripe.checkout.sessions.create({
      success_url: 'http://localhost:3000',
      cancel_url: 'http://localhost:3000',

      line_items: [
        {
          price: pricingUrl,
          quantity: quantity,
        },
      ],
      mode: 'payment',
    });
    // const response = await this.checkPaymentStatus(
    //   'cs_test_a1BAQtnT37P20uv06NwCklmNbsNof9fJ5IHYK5ZYvQcHn7Wl9gfUFjLWNX',
    // );
    return checkoutSession;
  }

  async getSession(id: string) {
    return await this.stripe.checkout.sessions.retrieve(id);
  }

  async expireSession(id: string) {
    return await this.stripe.checkout.sessions.expire(id);
  }

  async createPrice(title: string, amountInCent: number) {
    const price = await this.stripe.prices.create({
      currency: 'usd',
      unit_amount: amountInCent,
      product_data: {
        name: title,
      },
    });
    return price.id;
  }

  async updatePrice(priceId: string) {
    return this.stripe.prices.update(priceId, {
      metadata: {
        order_id: '6735',
      },
    });
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Stripe } from 'stripe';
import { ClientProxy } from '@nestjs/microservices';
import { NOTIFICATIONS_SERVICE } from '@app/common';
import { PaymentsCreateChargeDto } from './dto/payments-create.dto';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(
    this.configService.get('STRIPE_SECRET_KEY'),
    { apiVersion: '2023-08-16' },
  );

  constructor(
    private readonly configService: ConfigService,
    @Inject(NOTIFICATIONS_SERVICE)
    private readonly notificationsService: ClientProxy,
  ) {}

  // https://stripe.com/docs/api/payment_methods/create?lang=node
  // https://stripe.com/docs/api/payment_intents/create?lang=node
  async createCharge({ amount, card, email }: PaymentsCreateChargeDto) {
    // not for testing
    // const paymentMethod = await this.stripe.paymentMethods.create({
    //   type: 'card',
    //   card,
    // });

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'usd',
      // payment_method: paymentMethod.id,
      confirm: true,
      payment_method: 'pm_card_visa',
      return_url: 'http://localhost:3200', // for testing
    });

    this.notificationsService.emit('notify_email', {
      email,
      text: `Your reservation has been created, you have been charged $${amount} on your card ending in ${card.number.slice(
        -4,
      )}`,
    });

    return paymentIntent;
  }
}

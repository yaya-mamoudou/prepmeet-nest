import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './auth/entities/auth.entity';
import { ExpertProfileModule } from './expert-profile/expert-profile.module';
import { ExpertProfile } from './expert-profile/entities/expert-profile.entity';
import { FocusArea } from './expert-profile/entities/focus-area.entity';
import { EducationalExperience } from './expert-profile/entities/educational-experience.entity';
import { Degrees } from './expert-profile/entities/degrees.entity';
import { Certification } from './expert-profile/entities/certification.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { VerificationCode } from './auth/entities/verification-code';
import { VerificationEmail } from './auth/entities/verification-email';
// import { VerificationEmail } from './auth/entities/verification-email';
import { MessagesModule } from './messages/messages.module';
import { Conversation } from './messages/entity/conversation.entity';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    AuthModule,
    ExpertProfileModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [
          ExpertProfile,
          User,
          FocusArea,
          EducationalExperience,
          Degrees,
          Certification,
          VerificationCode,
          VerificationEmail,
          Conversation,
        ],
        synchronize: true,
      }),
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('EMAIL_HOST'),
          auth: {
            user: configService.get('EMAIL_USERNAME'),
            pass: configService.get('EMAIL_PASSWORD'),
          },
        },
      }),
    }),
    MessagesModule,
  ],
})
export class AppModule {}

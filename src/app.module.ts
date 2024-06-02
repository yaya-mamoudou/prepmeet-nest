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
        ],
        synchronize: true,
      }),
    }),
  ],
})
export class AppModule {}

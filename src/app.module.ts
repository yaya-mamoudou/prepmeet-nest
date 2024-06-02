import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './auth/entities/auth.entity';
import { ExpertProfileModule } from './expert-profile/expert-profile.module';
import { ExpertProfile } from './expert-profile/entities/expert-profile.entity';

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
        entities: [ExpertProfile, User],
        synchronize: true,
      }),
    }),
  ],
})
export class AppModule {}

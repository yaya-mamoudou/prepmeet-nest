import { Module } from '@nestjs/common';
import { GoogleService } from './google.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { GoogleController } from './google.controller';
import { GoogleRefreshToken } from './entities/google-refresh-token';

@Module({
  imports: [TypeOrmModule.forFeature([GoogleRefreshToken]), AuthModule],
  controllers: [GoogleController],
  providers: [GoogleService],
  exports: [GoogleService],
})
export class GoogleModule {}

import { Module } from '@nestjs/common';
import { ShortenerService } from './shortener.service';
import { ShortenerController } from './shortener.controller';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [ShortenerService, DatabaseService],
  controllers: [ShortenerController],
})
export class ShortenerModule {}

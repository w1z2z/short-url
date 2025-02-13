import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { ShortenerService } from './shortener.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Controller()
export class ShortenerController {
  private readonly baseUrl: string;

  constructor(
    private readonly shortenerService: ShortenerService,
    private readonly configService: ConfigService,
  ) {
    const host = this.configService.get('HOST', 'localhost');
    const port = this.configService.get('PORT', 8000);
    this.baseUrl = `http://${host}:${port}/`;
  }

  @Post('create-short')
  async createShortUrl(
    @Body('longUrl') longUrl: string,
  ): Promise<{ shortUrl: string }> {
    const shortId = await this.shortenerService.createShortUrl(longUrl);
    return { shortUrl: `${this.baseUrl}${shortId}` };
  }

  @Get(':shortId')
  async getLongUrl(
    @Param('shortId') shortId: string,
    @Res() res: Response,
  ): Promise<void> {
    const longUrl = await this.shortenerService.getLongUrl(shortId);
    if (!longUrl) {
      throw new NotFoundException('Short URL not found');
    }

    res.redirect(longUrl);
  }

  @Get('analytics/:shortId')
  async getAnalytics(@Param('shortId') shortId: string) {
    const analytics = await this.shortenerService.getAnalytics(shortId);
    if (!analytics) {
      throw new NotFoundException('Short URL not found');
    }

    return analytics;
  }
}

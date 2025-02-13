import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import Redis from 'ioredis';

@Injectable()
export class ShortenerService {
  constructor(
    private readonly prisma: DatabaseService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  private generateShortId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  private async cacheShortId(shortId: string, longUrl: string): Promise<void> {
    await this.redisClient.set(
      `short:${shortId}`,
      longUrl,
      'EX',
      60 * 60 * 24 * 30,
    );
  }

  async createShortUrl(longUrl: string): Promise<string> {
    const shortId = this.generateShortId();
    console.log(`Creating short URL: ${shortId} for ${longUrl}`);

    await this.prisma.url.create({
      data: {
        shortId,
        longUrl,
      },
    });

    await this.cacheShortId(shortId, longUrl);

    return shortId;
  }

  async getLongUrl(shortId: string): Promise<string | null> {
    try {
      console.log(`Fetching long URL for short ID: ${shortId}`);

      let longUrl = await this.redisClient.get(`short:${shortId}`);

      if (!longUrl) {
        const entry = await this.prisma.url.findUnique({
          where: { shortId },
        });

        if (!entry) return null;

        longUrl = entry.longUrl;
        await this.cacheShortId(shortId, longUrl);
      }

      await this.prisma.click.create({
        data: {
          shortId,
        },
      });

      return longUrl;
    } catch (error) {
      console.error('Error fetching long URL:', error);
      return null;
    }
  }

  async getAnalytics(shortId: string) {
    try {
      console.log(`Fetching analytics for short ID: ${shortId}`);

      // Находим запись в таблице Url
      const urlEntry = await this.prisma.url.findUnique({
        where: { shortId },
        include: { clicks: true }, // Включаем связанные записи из таблицы Click
      });

      if (!urlEntry) return null;

      // Формируем ответ
      return {
        shortId: urlEntry.shortId,
        longUrl: urlEntry.longUrl,
        clickCount: urlEntry.clicks.length, // Количество переходов
        createdAt: urlEntry.createdAt,
        clicks: urlEntry.clicks.map((click) => ({
          id: click.id,
          timestamp: click.timestamp,
        })),
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }
  }
}
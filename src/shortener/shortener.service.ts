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

    await this.prisma.url.create({ data: { shortId, longUrl } });

    await this.cacheShortId(shortId, longUrl);

    return shortId;
  }

  async getLongUrl(shortId: string): Promise<string | null> {
    try {
      console.log(`Fetching long URL for short ID: ${shortId}`);

      const cachedLongUrl = await this.redisClient.get(`short:${shortId}`);
      if (cachedLongUrl) return cachedLongUrl;

      const entry = await this.prisma.url.findUnique({ where: { shortId } });
      if (!entry) return null;

      await this.cacheShortId(shortId, entry.longUrl);
      return entry.longUrl;
    } catch (error) {
      console.error('Error fetching long URL:', error);
      return null;
    }
  }
}
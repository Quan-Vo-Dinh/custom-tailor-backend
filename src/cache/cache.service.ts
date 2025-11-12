import { Injectable, Logger } from "@nestjs/common";
import { createClient, type RedisClientType } from "redis";

@Injectable()
export class CacheService {
  private client: RedisClientType;
  private logger = new Logger("CacheService");
  private readonly DEFAULT_TTL = 3600; // 1 hour

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL || "redis://localhost:6379",
      });

      this.client.on("error", (err) => {
        this.logger.error(`Redis error: ${err.message}`);
      });

      await this.client.connect();
      this.logger.log("Redis connected successfully");
    } catch (error) {
      this.logger.error(
        `Failed to connect to Redis: ${(error as Error).message}`
      );
      // Gracefully handle connection failure - cache is optional
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.warn(
        `Cache get error for key ${key}: ${(error as Error).message}`
      );
      return null;
    }
  }

  async set<T>(
    key: string,
    value: T,
    ttl: number = this.DEFAULT_TTL
  ): Promise<void> {
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      this.logger.warn(
        `Cache set error for key ${key}: ${(error as Error).message}`
      );
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.warn(
        `Cache delete error for key ${key}: ${(error as Error).message}`
      );
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      this.logger.warn(
        `Cache invalidate pattern error: ${(error as Error).message}`
      );
    }
  }

  // Product cache keys
  async cacheProducts(products: any[]): Promise<void> {
    await this.set("products:all", products, 3600);
  }

  async getProductsFromCache(): Promise<any[] | null> {
    return await this.get("products:all");
  }

  async invalidateProductsCache(): Promise<void> {
    await this.invalidatePattern("products:*");
  }

  async cacheProductById(productId: string, product: any): Promise<void> {
    await this.set(`products:${productId}`, product, 3600);
  }

  async getProductFromCache(productId: string): Promise<any | null> {
    return await this.get(`products:${productId}`);
  }

  // Category cache
  async cacheCategories(categories: any[]): Promise<void> {
    await this.set("categories:all", categories, 7200);
  }

  async getCategoriesFromCache(): Promise<any[] | null> {
    return await this.get("categories:all");
  }

  async invalidateCategoriesCache(): Promise<void> {
    await this.delete("categories:all");
  }

  // Appointment slots cache (short TTL for real-time availability)
  async cacheSlots(date: string, slots: any[]): Promise<void> {
    await this.set(`slots:${date}`, slots, 300); // 5 minutes only
  }

  async getSlotsFromCache(date: string): Promise<any[] | null> {
    return await this.get(`slots:${date}`);
  }

  async invalidateSlotsCache(date: string): Promise<void> {
    await this.delete(`slots:${date}`);
  }

  // Slot locking (for concurrency control in bookings)
  async lockSlot(
    date: string,
    startTime: string,
    duration = 300
  ): Promise<boolean> {
    const lockKey = `slot:lock:${date}:${startTime}`;
    try {
      const result = await this.client.setNX(lockKey, "1");
      if (result) {
        await this.client.expire(lockKey, duration);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.warn(`Slot locking error: ${(error as Error).message}`);
      return false;
    }
  }

  async unlockSlot(date: string, startTime: string): Promise<void> {
    const lockKey = `slot:lock:${date}:${startTime}`;
    await this.delete(lockKey);
  }

  async isSlotLocked(date: string, startTime: string): Promise<boolean> {
    const lockKey = `slot:lock:${date}:${startTime}`;
    try {
      const value = await this.client.get(lockKey);
      return value !== null;
    } catch (error) {
      this.logger.warn(`Slot lock check error: ${(error as Error).message}`);
      return false;
    }
  }

  // Fabrics and StyleOptions cache
  async cacheFabrics(fabrics: any[]): Promise<void> {
    await this.set("fabrics:all", fabrics, 7200);
  }

  async getFabricsFromCache(): Promise<any[] | null> {
    return await this.get("fabrics:all");
  }

  async invalidateFabricsCache(): Promise<void> {
    await this.delete("fabrics:all");
  }

  async cacheStyleOptions(styleOptions: any[]): Promise<void> {
    await this.set("style-options:all", styleOptions, 7200);
  }

  async getStyleOptionsFromCache(): Promise<any[] | null> {
    return await this.get("style-options:all");
  }

  async invalidateStyleOptionsCache(): Promise<void> {
    await this.delete("style-options:all");
  }
}

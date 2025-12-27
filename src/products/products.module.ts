import { Module } from "@nestjs/common";
import { PrismaModule } from "@/prisma/prisma.module";
import { CacheModule } from "@/cache/cache.module";
import { ProductsService } from "./products.service";
import { ProductsController } from "./products.controller";
import { CategoriesService } from "./services/categories.service";
import { FabricsService } from "./services/fabrics.service";
import { StyleOptionsService } from "./services/style-options.service";

@Module({
  imports: [PrismaModule, CacheModule],
  providers: [
    ProductsService,
    CategoriesService,
    FabricsService,
    StyleOptionsService,
  ],
  controllers: [ProductsController],
  exports: [
    ProductsService,
    CategoriesService,
    FabricsService,
    StyleOptionsService,
  ],
})
export class ProductsModule {}

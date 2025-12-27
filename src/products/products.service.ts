import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { CacheService } from "@/cache/cache.service";
import type { CreateProductDto } from "./dto/create-product.dto";
import type { UpdateProductDto } from "./dto/update-product.dto";

@Injectable()
export class ProductsService {
  private logger = new Logger("ProductsService");

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService
  ) {}

  async createProduct(dto: CreateProductDto) {
    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    const product = await this.prisma.product.create({
      data: {
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description,
        basePrice: dto.basePrice,
        images: dto.images || [],
        isPublished: dto.isPublished ?? true,
      },
      include: {
        category: true,
        fabrics: true,
        styleOptions: true,
      },
    });

    return product;
  }

  async getProductById(productId: string) {
    // Try to get from cache first
    const cacheKey = `product:${productId}`;
    const cachedProduct = await this.cacheService.get(cacheKey);
    if (cachedProduct) {
      this.logger.debug(`Cache hit for product ${productId}`);
      return cachedProduct;
    }

    this.logger.debug(`Cache miss for product ${productId}, fetching from DB`);

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        fabrics: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            priceAdjustment: true,
          },
        },
        styleOptions: {
          select: {
            id: true,
            name: true,
            type: true,
            priceAdjustment: true,
            imageUrl: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    // Transform to match frontend expectations
    const transformedProduct = {
      ...product,
      category: product.category.name as any, // Frontend expects enum
      images: (product.images as any) || [],
      availableFabrics: product.fabrics.map((f) => ({
        id: f.id,
        name: f.name,
        material: f.name, // TODO: Add material field to schema
        color: f.name, // TODO: Add color field to schema
        price: Number(f.priceAdjustment),
        image: f.imageUrl || "",
        stock: 999, // TODO: Add stock field to schema
      })),
      availableStyles: product.styleOptions.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.type,
        type: s.type,
        description: s.name, // TODO: Add description field to schema
        priceModifier: Number(s.priceAdjustment),
        imageUrl: (s as any).imageUrl || "",
      })),
      slug: product.category.slug, // Use category slug as product slug
    };

    // Cache for 1 hour
    await this.cacheService.set(cacheKey, transformedProduct, 3600);

    return transformedProduct;
  }

  async getAllProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
    sortBy?: "name" | "price" | "createdAt";
    sortOrder?: "asc" | "desc";
  }) {
    const page = params?.page || 1;
    const limit = params?.limit || 12;
    const skip = (page - 1) * limit;

    // Build cache key from params (only for simple queries without search)
    const isSimpleQuery =
      !params?.search && !params?.minPrice && !params?.maxPrice;
    const cacheKey = isSimpleQuery
      ? `products:list:${params?.category || "all"}:${page}:${limit}:${params?.sortBy || "createdAt"}:${params?.sortOrder || "desc"}`
      : null;

    // Try cache for simple queries
    if (cacheKey) {
      const cachedResult = await this.cacheService.get(cacheKey);
      if (cachedResult) {
        this.logger.debug(`Cache hit for products list`);
        return cachedResult;
      }
    }

    const where: any = { isPublished: true };

    // Category filter
    if (params?.category) {
      // Try to find by slug first, then by id
      const category = await this.prisma.category.findFirst({
        where: {
          OR: [{ slug: params.category }, { id: params.category }],
        },
      });
      if (category) {
        where.categoryId = category.id;
      }
    }

    // Search filter
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ];
    }

    // Price filters
    if (params?.minPrice !== undefined) {
      where.basePrice = { ...where.basePrice, gte: params.minPrice };
    }
    if (params?.maxPrice !== undefined) {
      where.basePrice = { ...where.basePrice, lte: params.maxPrice };
    }

    // Featured filter (if needed in future, add featured field to schema)
    // if (params?.featured !== undefined) {
    //   where.featured = params.featured
    // }

    // Sort
    const sortBy = params?.sortBy || "createdAt";
    const sortOrder = params?.sortOrder || "desc";
    const orderBy: any = {};
    if (sortBy === "price") {
      orderBy.basePrice = sortOrder;
    } else if (sortBy === "name") {
      orderBy.name = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          fabrics: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              priceAdjustment: true,
            },
          },
          styleOptions: {
            select: { id: true, name: true, type: true, priceAdjustment: true },
          },
        },
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Transform products to match frontend expectations
    const transformedProducts = products.map((product) => ({
      ...product,
      category: product.category.name as any, // Frontend expects enum
      images: (product.images as any) || [],
      availableFabrics: product.fabrics.map((f) => ({
        id: f.id,
        name: f.name,
        material: f.name, // TODO: Add material field to schema
        color: f.name, // TODO: Add color field to schema
        price: Number(f.priceAdjustment),
        image: f.imageUrl || "",
        stock: 999, // TODO: Add stock field to schema
      })),
      availableStyles: product.styleOptions.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.type,
        description: s.name, // TODO: Add description field to schema
        priceModifier: Number(s.priceAdjustment),
      })),
      slug: product.category.slug, // Use category slug as product slug
      featured: false, // TODO: Add featured field to schema
    }));

    const result = {
      data: transformedProducts,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };

    // Cache result for simple queries (30 minutes)
    if (cacheKey) {
      await this.cacheService.set(cacheKey, result, 1800);
    }

    return result;
  }

  async searchProducts(query: string, skip = 0, take = 10) {
    const products = await this.prisma.product.findMany({
      where: {
        isPublished: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      skip,
      take,
      include: {
        category: true,
        fabrics: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            priceAdjustment: true,
          },
        },
        styleOptions: {
          select: { id: true, name: true, type: true, priceAdjustment: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const total = await this.prisma.product.count({
      where: {
        isPublished: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
    });

    // Transform products to match frontend expectations
    const transformedProducts = products.map((product) => ({
      ...product,
      category: product.category.name as any,
      images: (product.images as any) || [],
      availableFabrics: product.fabrics.map((f) => ({
        id: f.id,
        name: f.name,
        material: f.name,
        color: f.name,
        price: Number(f.priceAdjustment),
        image: f.imageUrl || "",
        stock: 999,
      })),
      availableStyles: product.styleOptions.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.type,
        description: s.name,
        priceModifier: Number(s.priceAdjustment),
      })),
      slug: product.category.slug,
      featured: false,
    }));

    return { data: transformedProducts, total, skip, take };
  }

  async updateProduct(productId: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    if (dto.categoryId && dto.categoryId !== product.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new NotFoundException("Category not found");
      }
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id: productId },
      data: {
        name: dto.name ?? product.name,
        description: dto.description ?? product.description,
        basePrice: dto.basePrice ?? product.basePrice,
        images: dto.images ?? product.images,
        categoryId: dto.categoryId ?? product.categoryId,
        isPublished: dto.isPublished ?? product.isPublished,
      },
      include: {
        category: true,
        fabrics: true,
        styleOptions: true,
      },
    });

    return updatedProduct;
  }

  async deleteProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    await this.prisma.product.delete({
      where: { id: productId },
    });

    return { message: "Product deleted successfully" };
  }

  async assignFabricToProduct(productId: string, fabricId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const fabric = await this.prisma.fabric.findUnique({
      where: { id: fabricId },
    });

    if (!fabric) {
      throw new NotFoundException("Fabric not found");
    }

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        fabrics: {
          connect: { id: fabricId },
        },
      },
    });

    return { message: "Fabric assigned to product" };
  }

  async removeFabricFromProduct(productId: string, fabricId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        fabrics: {
          disconnect: { id: fabricId },
        },
      },
    });

    return { message: "Fabric removed from product" };
  }

  async assignStyleOptionToProduct(productId: string, styleOptionId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const styleOption = await this.prisma.styleOption.findUnique({
      where: { id: styleOptionId },
    });

    if (!styleOption) {
      throw new NotFoundException("Style option not found");
    }

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        styleOptions: {
          connect: { id: styleOptionId },
        },
      },
    });

    return { message: "Style option assigned to product" };
  }

  async removeStyleOptionFromProduct(productId: string, styleOptionId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        styleOptions: {
          disconnect: { id: styleOptionId },
        },
      },
    });

    return { message: "Style option removed from product" };
  }
}

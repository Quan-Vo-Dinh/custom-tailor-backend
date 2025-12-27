import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  UseGuards,
  Query,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";
import { ProductsService } from "./products.service";
import { CategoriesService } from "./services/categories.service";
import { FabricsService } from "./services/fabrics.service";
import { StyleOptionsService } from "./services/style-options.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CreateFabricDto } from "./dto/create-fabric.dto";
import { UpdateFabricDto } from "./dto/update-fabric.dto";
import { CreateStyleOptionDto } from "./dto/create-style-option.dto";
import { UpdateStyleOptionDto } from "./dto/update-style-option.dto";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { Roles } from "@/auth/decorators/roles.decorator";
import { RolesGuard } from "@/auth/guards/roles.guard";
import { Role } from "@prisma/client";

@ApiTags("Products")
@Controller("products")
export class ProductsController {
  constructor(
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
    private fabricsService: FabricsService,
    private styleOptionsService: StyleOptionsService
  ) {}

  // Product endpoints (Public)
  @Get()
  @ApiOperation({
    summary: "Get all published products",
    description:
      "Retrieve paginated list of published products with filters and sorting",
  })
  @ApiQuery({
    name: "page",
    required: false,
    description: "Page number (1-based)",
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of records per page",
    example: 12,
  })
  @ApiQuery({
    name: "search",
    required: false,
    description: "Search query for product name/description",
  })
  @ApiQuery({
    name: "category",
    required: false,
    description: "Filter by category (slug or id)",
  })
  @ApiQuery({
    name: "minPrice",
    required: false,
    description: "Minimum price filter",
  })
  @ApiQuery({
    name: "maxPrice",
    required: false,
    description: "Maximum price filter",
  })
  @ApiQuery({
    name: "featured",
    required: false,
    description: "Filter featured products",
  })
  @ApiQuery({
    name: "sortBy",
    required: false,
    description: "Sort field (name, price, createdAt)",
    example: "createdAt",
  })
  @ApiQuery({
    name: "sortOrder",
    required: false,
    description: "Sort order (asc, desc)",
    example: "desc",
  })
  @ApiResponse({
    status: 200,
    description: "List of products",
    schema: {
      example: {
        data: [
          {
            id: "prod_123",
            name: "Custom Suit",
            description: "Premium tailored suit",
            basePrice: 1500000,
            categoryId: "cat_123",
            images: ["https://example.com/image.jpg"],
            isPublished: true,
          },
        ],
        meta: {
          total: 50,
          page: 1,
          limit: 12,
          totalPages: 5,
        },
      },
    },
  })
  async getAllProducts(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string,
    @Query("category") category?: string,
    @Query("minPrice") minPrice?: string,
    @Query("maxPrice") maxPrice?: string,
    @Query("featured") featured?: string,
    @Query("sortBy") sortBy?: string,
    @Query("sortOrder") sortOrder?: string
  ) {
    return this.productsService.getAllProducts({
      page: page ? Number.parseInt(page) : 1,
      limit: limit ? Number.parseInt(limit) : 12,
      search,
      category,
      minPrice: minPrice ? Number.parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? Number.parseFloat(maxPrice) : undefined,
      featured: featured === "true",
      sortBy: (sortBy as any) || "createdAt",
      sortOrder: (sortOrder as any) || "desc",
    });
  }

  @Get("search")
  @ApiOperation({
    summary: "Search products by name or description",
    description: "Full-text search across product names and descriptions",
  })
  @ApiQuery({
    name: "q",
    required: true,
    description: "Search query",
    example: "suit",
  })
  @ApiQuery({
    name: "page",
    required: false,
    description: "Page number (1-based)",
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of records per page",
    example: 10,
  })
  @ApiResponse({ status: 200, description: "Search results" })
  @ApiResponse({ status: 400, description: "Search query is required" })
  async searchProducts(
    @Query("q") query?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    if (!query || query.trim().length === 0) {
      throw new Error("Search query is required");
    }

    const pageNum = page ? Number.parseInt(page) : 1
    const limitNum = limit ? Number.parseInt(limit) : 10
    const skip = (pageNum - 1) * limitNum

    const result = await this.productsService.searchProducts(query, skip, limitNum);
    const totalPages = Math.ceil(result.total / limitNum)

    return {
      data: result.data,
      meta: {
        total: result.total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    };
  }

  // Category endpoints (Public - must be before :productId route)
  @Get("categories")
  @ApiOperation({
    summary: "Get all categories",
    description: "Retrieve all categories with product counts",
  })
  @ApiResponse({
    status: 200,
    description: "List of categories",
    schema: {
      example: [
        {
          id: "cat_123",
          name: "Vest",
          slug: "vest",
          _count: { products: 10 },
        },
      ],
    },
  })
  async getAllCategories() {
    const categories = await this.categoriesService.getAllCategories();
    return categories.map((cat: any) => ({
      value: cat.id,
      label: cat.name,
      count: cat._count?.products || 0,
    }));
  }

  // Fabric endpoints (Public - must be before :productId route)
  @Get("fabrics")
  @ApiOperation({
    summary: "Get all fabrics",
    description: "Retrieve all available fabric materials",
  })
  @ApiQuery({
    name: "productId",
    required: false,
    description: "Filter fabrics by product ID",
  })
  @ApiQuery({
    name: "category",
    required: false,
    description: "Filter fabrics by category",
  })
  @ApiResponse({
    status: 200,
    description: "List of fabrics",
    schema: {
      example: [
        {
          id: "fab_123",
          name: "Premium Wool",
          priceAdjustment: 200000,
          imageUrl: "https://example.com/wool.jpg",
        },
      ],
    },
  })
  async getAllFabrics(
    @Query("productId") productId?: string,
    @Query("category") category?: string
  ) {
    return this.fabricsService.getAllFabrics(productId, category);
  }

  // StyleOption endpoints (Public - must be before :productId route)
  @Get("style-options")
  @ApiOperation({
    summary: "Get all style options",
    description:
      "Retrieve all customization options (collar, cuff, button, etc.), optionally filtered by type",
  })
  @ApiQuery({
    name: "type",
    required: false,
    description: "Filter by option type (e.g., COLLAR, CUFF, BUTTON)",
  })
  @ApiQuery({
    name: "productId",
    required: false,
    description: "Filter style options by product ID",
  })
  @ApiQuery({
    name: "category",
    required: false,
    description: "Filter style options by category",
  })
  @ApiResponse({
    status: 200,
    description: "List of style options",
    schema: {
      example: [
        {
          id: "style_123",
          name: "Classic Collar",
          type: "COLLAR",
          priceAdjustment: 50000,
        },
      ],
    },
  })
  async getAllStyleOptions(
    @Query("type") type?: string,
    @Query("productId") productId?: string,
    @Query("category") category?: string
  ) {
    return this.styleOptionsService.getAllStyleOptions(type, productId, category);
  }

  @Get(":productId")
  @ApiOperation({
    summary: "Get product details",
    description:
      "Retrieve detailed information about a specific product including fabrics and style options",
  })
  @ApiParam({
    name: "productId",
    description: "Product ID",
    example: "prod_123",
  })
  @ApiResponse({ status: 200, description: "Product details" })
  @ApiResponse({ status: 404, description: "Product not found" })
  async getProductById(@Param("productId") productId: string) {
    return this.productsService.getProductById(productId);
  }

  // Product endpoints (Admin only)
  @Post()
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create new product (Admin only)",
    description: "Create a new product with details, category, and pricing",
  })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: "Product created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async createProduct(@Body() dto: CreateProductDto) {
    return this.productsService.createProduct(dto);
  }

  @Put(":productId")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: "Update product (Admin only)",
    description: "Update product information, pricing, or publish status",
  })
  @ApiParam({
    name: "productId",
    description: "Product ID",
    example: "prod_123",
  })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: "Product updated successfully" })
  @ApiResponse({ status: 404, description: "Product not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async updateProduct(
    @Param("productId") productId: string,
    @Body() dto: UpdateProductDto
  ) {
    return this.productsService.updateProduct(productId, dto);
  }

  @Delete(":productId")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Delete product (Admin only)",
    description: "Permanently delete a product",
  })
  @ApiParam({
    name: "productId",
    description: "Product ID",
    example: "prod_123",
  })
  @ApiResponse({ status: 204, description: "Product deleted successfully" })
  @ApiResponse({ status: 404, description: "Product not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async deleteProduct(@Param("productId") productId: string) {
    return this.productsService.deleteProduct(productId);
  }

  // Fabric assignment endpoints
  @Post(":productId/fabrics/:fabricId")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: "Assign fabric to product (Admin only)",
    description: "Link an available fabric to a product",
  })
  @ApiParam({
    name: "productId",
    description: "Product ID",
    example: "prod_123",
  })
  @ApiParam({ name: "fabricId", description: "Fabric ID", example: "fab_123" })
  @ApiResponse({ status: 200, description: "Fabric assigned successfully" })
  @ApiResponse({ status: 404, description: "Product or Fabric not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async assignFabricToProduct(
    @Param("productId") productId: string,
    @Param("fabricId") fabricId: string
  ) {
    return this.productsService.assignFabricToProduct(productId, fabricId);
  }

  @Delete(":productId/fabrics/:fabricId")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Remove fabric from product (Admin only)",
    description: "Unlink a fabric from a product",
  })
  @ApiParam({
    name: "productId",
    description: "Product ID",
    example: "prod_123",
  })
  @ApiParam({ name: "fabricId", description: "Fabric ID", example: "fab_123" })
  @ApiResponse({ status: 204, description: "Fabric removed successfully" })
  @ApiResponse({ status: 404, description: "Product or Fabric not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async removeFabricFromProduct(
    @Param("productId") productId: string,
    @Param("fabricId") fabricId: string
  ) {
    return this.productsService.removeFabricFromProduct(productId, fabricId);
  }

  // StyleOption assignment endpoints
  @Post(":productId/style-options/:styleOptionId")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: "Assign style option to product (Admin only)",
    description:
      "Link a style option (collar, cuff, button, etc.) to a product",
  })
  @ApiParam({
    name: "productId",
    description: "Product ID",
    example: "prod_123",
  })
  @ApiParam({
    name: "styleOptionId",
    description: "Style Option ID",
    example: "style_123",
  })
  @ApiResponse({
    status: 200,
    description: "Style option assigned successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Product or Style Option not found",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async assignStyleOptionToProduct(
    @Param("productId") productId: string,
    @Param("styleOptionId") styleOptionId: string
  ) {
    return this.productsService.assignStyleOptionToProduct(
      productId,
      styleOptionId
    );
  }

  @Delete(":productId/style-options/:styleOptionId")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Remove style option from product (Admin only)",
    description: "Unlink a style option from a product",
  })
  @ApiParam({
    name: "productId",
    description: "Product ID",
    example: "prod_123",
  })
  @ApiParam({
    name: "styleOptionId",
    description: "Style Option ID",
    example: "style_123",
  })
  @ApiResponse({
    status: 204,
    description: "Style option removed successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Product or Style Option not found",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async removeStyleOptionFromProduct(
    @Param("productId") productId: string,
    @Param("styleOptionId") styleOptionId: string
  ) {
    return this.productsService.removeStyleOptionFromProduct(
      productId,
      styleOptionId
    );
  }

  // Category endpoints (Admin - get by ID)

  @Get("categories/:categoryId")
  @ApiOperation({
    summary: "Get category by ID",
    description: "Retrieve category details including products count",
  })
  @ApiParam({
    name: "categoryId",
    description: "Category ID",
    example: "cat_123",
  })
  @ApiResponse({ status: 200, description: "Category details" })
  @ApiResponse({ status: 404, description: "Category not found" })
  async getCategoryById(@Param("categoryId") categoryId: string) {
    return this.categoriesService.getCategoryById(categoryId);
  }

  @Post("categories")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create category (Admin only)",
    description: "Create a new product category",
  })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: "Category created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(dto);
  }

  @Put("categories/:categoryId")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: "Update category (Admin only)",
    description: "Update category name or description",
  })
  @ApiParam({
    name: "categoryId",
    description: "Category ID",
    example: "cat_123",
  })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 200, description: "Category updated successfully" })
  @ApiResponse({ status: 404, description: "Category not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async updateCategory(
    @Param("categoryId") categoryId: string,
    @Body() dto: CreateCategoryDto
  ) {
    return this.categoriesService.updateCategory(categoryId, dto);
  }

  @Delete("categories/:categoryId")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Delete category (Admin only)",
    description: "Permanently delete a category",
  })
  @ApiParam({
    name: "categoryId",
    description: "Category ID",
    example: "cat_123",
  })
  @ApiResponse({ status: 204, description: "Category deleted successfully" })
  @ApiResponse({ status: 404, description: "Category not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async deleteCategory(@Param("categoryId") categoryId: string) {
    return this.categoriesService.deleteCategory(categoryId);
  }

  // Fabric endpoints (Admin - get by ID)

  @Get("fabrics/:fabricId")
  @ApiOperation({
    summary: "Get fabric by ID",
    description: "Retrieve detailed information about a specific fabric",
  })
  @ApiParam({ name: "fabricId", description: "Fabric ID", example: "fab_123" })
  @ApiResponse({ status: 200, description: "Fabric details" })
  @ApiResponse({ status: 404, description: "Fabric not found" })
  async getFabricById(@Param("fabricId") fabricId: string) {
    return this.fabricsService.getFabricById(fabricId);
  }

  @Post("fabrics")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create fabric (Admin only)",
    description: "Add a new fabric material option",
  })
  @ApiBody({ type: CreateFabricDto })
  @ApiResponse({ status: 201, description: "Fabric created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async createFabric(@Body() dto: CreateFabricDto) {
    return this.fabricsService.createFabric(dto);
  }

  @Put("fabrics/:fabricId")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: "Update fabric (Admin only)",
    description: "Update fabric details or pricing",
  })
  @ApiParam({ name: "fabricId", description: "Fabric ID", example: "fab_123" })
  @ApiBody({ type: UpdateFabricDto })
  @ApiResponse({ status: 200, description: "Fabric updated successfully" })
  @ApiResponse({ status: 404, description: "Fabric not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async updateFabric(
    @Param("fabricId") fabricId: string,
    @Body() dto: UpdateFabricDto
  ) {
    return this.fabricsService.updateFabric(fabricId, dto);
  }

  @Delete("fabrics/:fabricId")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Delete fabric (Admin only)",
    description: "Permanently delete a fabric option",
  })
  @ApiParam({ name: "fabricId", description: "Fabric ID", example: "fab_123" })
  @ApiResponse({ status: 204, description: "Fabric deleted successfully" })
  @ApiResponse({ status: 404, description: "Fabric not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async deleteFabric(@Param("fabricId") fabricId: string) {
    return this.fabricsService.deleteFabric(fabricId);
  }

  // StyleOption endpoints (Admin - get by ID)

  @Get("style-options/:styleOptionId")
  @ApiOperation({
    summary: "Get style option by ID",
    description: "Retrieve detailed information about a specific style option",
  })
  @ApiParam({
    name: "styleOptionId",
    description: "Style Option ID",
    example: "style_123",
  })
  @ApiResponse({ status: 200, description: "Style option details" })
  @ApiResponse({ status: 404, description: "Style option not found" })
  async getStyleOptionById(@Param("styleOptionId") styleOptionId: string) {
    return this.styleOptionsService.getStyleOptionById(styleOptionId);
  }

  @Post("style-options")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create style option (Admin only)",
    description: "Add a new customization option for products",
  })
  @ApiBody({ type: CreateStyleOptionDto })
  @ApiResponse({
    status: 201,
    description: "Style option created successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async createStyleOption(@Body() dto: CreateStyleOptionDto) {
    return this.styleOptionsService.createStyleOption(dto);
  }

  @Put("style-options/:styleOptionId")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: "Update style option (Admin only)",
    description: "Update style option details or pricing",
  })
  @ApiParam({
    name: "styleOptionId",
    description: "Style Option ID",
    example: "style_123",
  })
  @ApiBody({ type: UpdateStyleOptionDto })
  @ApiResponse({
    status: 200,
    description: "Style option updated successfully",
  })
  @ApiResponse({ status: 404, description: "Style option not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async updateStyleOption(
    @Param("styleOptionId") styleOptionId: string,
    @Body() dto: UpdateStyleOptionDto
  ) {
    return this.styleOptionsService.updateStyleOption(styleOptionId, dto);
  }

  @Delete("style-options/:styleOptionId")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Delete style option (Admin only)",
    description: "Permanently delete a style option",
  })
  @ApiParam({
    name: "styleOptionId",
    description: "Style Option ID",
    example: "style_123",
  })
  @ApiResponse({
    status: 204,
    description: "Style option deleted successfully",
  })
  @ApiResponse({ status: 404, description: "Style option not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async deleteStyleOption(@Param("styleOptionId") styleOptionId: string) {
    return this.styleOptionsService.deleteStyleOption(styleOptionId);
  }
}

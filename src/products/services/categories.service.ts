import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"
import type { CreateCategoryDto } from "../dto/create-category.dto"

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async getAllCategories() {
    return this.prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
    })
  }

  async getCategoryById(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        products: {
          where: { isPublished: true },
        },
      },
    })

    if (!category) {
      throw new NotFoundException("Category not found")
    }

    return category
  }

  async createCategory(dto: CreateCategoryDto) {
    // Check if slug already exists
    const existingCategory = await this.prisma.category.findUnique({
      where: { slug: dto.slug },
    })

    if (existingCategory) {
      throw new BadRequestException("Category slug already exists")
    }

    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        slug: dto.slug,
      },
    })

    return category
  }

  async updateCategory(categoryId: string, dto: CreateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      throw new NotFoundException("Category not found")
    }

    // Check if new slug conflicts
    if (dto.slug && dto.slug !== category.slug) {
      const existingCategory = await this.prisma.category.findUnique({
        where: { slug: dto.slug },
      })

      if (existingCategory) {
        throw new BadRequestException("Category slug already exists")
      }
    }

    const updatedCategory = await this.prisma.category.update({
      where: { id: categoryId },
      data: {
        name: dto.name ?? category.name,
        slug: dto.slug ?? category.slug,
      },
    })

    return updatedCategory
  }

  async deleteCategory(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      throw new NotFoundException("Category not found")
    }

    await this.prisma.category.delete({
      where: { id: categoryId },
    })

    return { message: "Category deleted successfully" }
  }
}

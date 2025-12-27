import { Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"
import type { CreateStyleOptionDto } from "../dto/create-style-option.dto"
import type { UpdateStyleOptionDto } from "../dto/update-style-option.dto"

@Injectable()
export class StyleOptionsService {
  constructor(private prisma: PrismaService) {}

  async getAllStyleOptions(type?: string, productId?: string, category?: string) {
    const where: any = {}
    
    if (type) {
      where.type = type
    }
    
    if (productId) {
      // Get style options that are assigned to this product
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        include: { styleOptions: true },
      })
      if (!product) {
        // If product doesn't exist, return empty array instead of throwing error
        // This allows the API to work even if product is not found
        return []
      }
      return product.styleOptions
    }
    
    if (category) {
      // Get style options from products in this category
      const products = await this.prisma.product.findMany({
        where: { category: { slug: category } },
        include: { styleOptions: true },
      })
      const styleOptionIds = new Set<string>()
      products.forEach((p) => {
        p.styleOptions.forEach((s) => styleOptionIds.add(s.id))
      })
      return this.prisma.styleOption.findMany({
        where: { id: { in: Array.from(styleOptionIds) }, ...where },
        orderBy: { type: "asc" },
      })
    }
    
    return this.prisma.styleOption.findMany({
      where,
      orderBy: { type: "asc" },
    })
  }

  async getStyleOptionById(styleOptionId: string) {
    const styleOption = await this.prisma.styleOption.findUnique({
      where: { id: styleOptionId },
    })

    if (!styleOption) {
      throw new NotFoundException("Style option not found")
    }

    return styleOption
  }

  async createStyleOption(dto: CreateStyleOptionDto) {
    const styleOption = await this.prisma.styleOption.create({
      data: {
        name: dto.name,
        type: dto.type,
        priceAdjustment: dto.priceAdjustment,
        imageUrl: dto.imageUrl,
      },
    })

    return styleOption
  }

  async updateStyleOption(styleOptionId: string, dto: UpdateStyleOptionDto) {
    const styleOption = await this.prisma.styleOption.findUnique({
      where: { id: styleOptionId },
    })

    if (!styleOption) {
      throw new NotFoundException("Style option not found")
    }

    const updatedStyleOption = await this.prisma.styleOption.update({
      where: { id: styleOptionId },
      data: {
        name: dto.name ?? styleOption.name,
        type: dto.type ?? styleOption.type,
        priceAdjustment: dto.priceAdjustment ?? styleOption.priceAdjustment,
        imageUrl: dto.imageUrl !== undefined ? dto.imageUrl : styleOption.imageUrl,
      },
    })

    return updatedStyleOption
  }

  async deleteStyleOption(styleOptionId: string) {
    const styleOption = await this.prisma.styleOption.findUnique({
      where: { id: styleOptionId },
    })

    if (!styleOption) {
      throw new NotFoundException("Style option not found")
    }

    await this.prisma.styleOption.delete({
      where: { id: styleOptionId },
    })

    return { message: "Style option deleted successfully" }
  }
}

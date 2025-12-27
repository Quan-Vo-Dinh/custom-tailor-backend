import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"
import type { CreateFabricDto } from "../dto/create-fabric.dto"
import type { UpdateFabricDto } from "../dto/update-fabric.dto"

@Injectable()
export class FabricsService {
  constructor(private prisma: PrismaService) {}

  async getAllFabrics(productId?: string, category?: string) {
    const where: any = {}
    
    if (productId) {
      // Get fabrics that are assigned to this product
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        include: { fabrics: true },
      })
      if (!product) {
        // If product doesn't exist, return empty array instead of throwing error
        // This allows the API to work even if product is not found
        return []
      }
        return product.fabrics
    }
    
    if (category) {
      // Get fabrics from products in this category
      const products = await this.prisma.product.findMany({
        where: { category: { slug: category } },
        include: { fabrics: true },
      })
      const fabricIds = new Set<string>()
      products.forEach((p) => {
        p.fabrics.forEach((f) => fabricIds.add(f.id))
      })
      return this.prisma.fabric.findMany({
        where: { id: { in: Array.from(fabricIds) } },
        orderBy: { name: "asc" },
      })
    }
    
    return this.prisma.fabric.findMany({
      where,
      orderBy: { name: "asc" },
    })
  }

  async getFabricById(fabricId: string) {
    const fabric = await this.prisma.fabric.findUnique({
      where: { id: fabricId },
    })

    if (!fabric) {
      throw new NotFoundException("Fabric not found")
    }

    return fabric
  }

  async createFabric(dto: CreateFabricDto) {
    // Check if fabric name already exists
    const existingFabric = await this.prisma.fabric.findUnique({
      where: { name: dto.name },
    })

    if (existingFabric) {
      throw new BadRequestException("Fabric name already exists")
    }

    const fabric = await this.prisma.fabric.create({
      data: {
        name: dto.name,
        imageUrl: dto.imageUrl,
        priceAdjustment: dto.priceAdjustment,
      },
    })

    return fabric
  }

  async updateFabric(fabricId: string, dto: UpdateFabricDto) {
    const fabric = await this.prisma.fabric.findUnique({
      where: { id: fabricId },
    })

    if (!fabric) {
      throw new NotFoundException("Fabric not found")
    }

    // Check if new name conflicts
    if (dto.name && dto.name !== fabric.name) {
      const existingFabric = await this.prisma.fabric.findUnique({
        where: { name: dto.name },
      })

      if (existingFabric) {
        throw new BadRequestException("Fabric name already exists")
      }
    }

    const updatedFabric = await this.prisma.fabric.update({
      where: { id: fabricId },
      data: {
        name: dto.name ?? fabric.name,
        imageUrl: dto.imageUrl ?? fabric.imageUrl,
        priceAdjustment: dto.priceAdjustment ?? fabric.priceAdjustment,
      },
    })

    return updatedFabric
  }

  async deleteFabric(fabricId: string) {
    const fabric = await this.prisma.fabric.findUnique({
      where: { id: fabricId },
    })

    if (!fabric) {
      throw new NotFoundException("Fabric not found")
    }

    await this.prisma.fabric.delete({
      where: { id: fabricId },
    })

    return { message: "Fabric deleted successfully" }
  }
}

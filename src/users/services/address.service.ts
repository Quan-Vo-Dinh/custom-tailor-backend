import { Injectable, ForbiddenException } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"
import type { CreateAddressDto } from "../dto/create-address.dto"
import type { UpdateAddressDto } from "../dto/update-address.dto"

@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) {}

  async getAddressesByUserId(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    })
  }

  async getAddressById(userId: string, addressId: string) {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    })

    if (!address || address.userId !== userId) {
      throw new ForbiddenException("Address not found or unauthorized")
    }

    return address
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    // If this is the first address or marked as default, set it as default
    const isFirstAddress = (await this.prisma.address.count({ where: { userId } })) === 0

    const address = await this.prisma.address.create({
      data: {
        userId,
        street: dto.street,
        city: dto.city,
        country: dto.country,
        isDefault: dto.isDefault || isFirstAddress,
      },
    })

    // If this address is default, unset other defaults
    if (address.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, id: { not: address.id } },
        data: { isDefault: false },
      })
    }

    return address
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    const address = await this.getAddressById(userId, addressId)

    const updatedAddress = await this.prisma.address.update({
      where: { id: addressId },
      data: {
        street: dto.street || address.street,
        city: dto.city || address.city,
        country: dto.country || address.country,
        isDefault: dto.isDefault !== undefined ? dto.isDefault : address.isDefault,
      },
    })

    // If updated address is default, unset other defaults
    if (updatedAddress.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, id: { not: addressId } },
        data: { isDefault: false },
      })
    }

    return updatedAddress
  }

  async deleteAddress(userId: string, addressId: string) {
    await this.getAddressById(userId, addressId)

    await this.prisma.address.delete({
      where: { id: addressId },
    })

    // If deleted address was default, set the first remaining address as default
    const remainingAddresses = await this.prisma.address.findMany({
      where: { userId },
      take: 1,
    })

    if (remainingAddresses.length > 0) {
      await this.prisma.address.update({
        where: { id: remainingAddresses[0].id },
        data: { isDefault: true },
      })
    }

    return { message: "Address deleted successfully" }
  }

  async setDefaultAddress(userId: string, addressId: string) {
    await this.getAddressById(userId, addressId)

    await this.prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    })

    const defaultAddress = await this.prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    })

    return defaultAddress
  }
}

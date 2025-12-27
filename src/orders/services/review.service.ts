import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"
import type { CreateReviewDto } from "../dto/create-review.dto"

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async createReview(userId: string, orderId: string, dto: CreateReviewDto) {
    // Verify order exists and belongs to user
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      throw new NotFoundException("Order not found")
    }

    if (order.userId !== userId) {
      throw new ForbiddenException("Not authorized to review this order")
    }

    // Check if order is completed
    if (order.status !== "COMPLETED") {
      throw new BadRequestException("Can only review completed orders")
    }

    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    })

    if (!product) {
      throw new NotFoundException("Product not found")
    }

    // Check if review already exists
    const existingReview = await this.prisma.review.findUnique({
      where: { orderId },
    })

    if (existingReview) {
      throw new BadRequestException("Review already exists for this order")
    }

    const review = await this.prisma.review.create({
      data: {
        userId,
        orderId,
        productId: dto.productId,
        rating: dto.rating,
        comment: dto.comment,
      },
    })

    return review
  }

  async getReviewsByProductId(productId: string, skip = 0, take = 10) {
    const reviews = await this.prisma.review.findMany({
      where: { productId },
      skip,
      take,
      include: {
        user: { include: { profile: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    const total = await this.prisma.review.count({ where: { productId } })

    return { data: reviews, total, skip, take }
  }

  async getReviewByOrderId(orderId: string) {
    const review = await this.prisma.review.findUnique({
      where: { orderId },
      include: {
        user: { include: { profile: true } },
      },
    })

    if (!review) {
      throw new NotFoundException("Review not found")
    }

    return review
  }

  async updateReview(reviewId: string, userId: string, dto: CreateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    })

    if (!review) {
      throw new NotFoundException("Review not found")
    }

    if (review.userId !== userId) {
      throw new ForbiddenException("Not authorized to update this review")
    }

    const updatedReview = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: dto.rating,
        comment: dto.comment,
      },
    })

    return updatedReview
  }

  async deleteReview(reviewId: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    })

    if (!review) {
      throw new NotFoundException("Review not found")
    }

    if (review.userId !== userId) {
      throw new ForbiddenException("Not authorized to delete this review")
    }

    await this.prisma.review.delete({
      where: { id: reviewId },
    })

    return { message: "Review deleted successfully" }
  }
}

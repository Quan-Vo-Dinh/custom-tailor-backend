export interface PriceCalculationInput {
  basePrice: number
  fabricPriceAdjustment: number
  styleOptionPriceAdjustment?: number
  quantity: number
}

export interface PriceCalculationResult {
  basePrice: number
  adjustments: number
  unitPrice: number
  totalPrice: number
}

export function calculateOrderItemPrice(input: PriceCalculationInput): PriceCalculationResult {
  const adjustments = input.fabricPriceAdjustment + (input.styleOptionPriceAdjustment || 0)
  const unitPrice = input.basePrice + adjustments
  const totalPrice = unitPrice * input.quantity

  return {
    basePrice: input.basePrice,
    adjustments,
    unitPrice,
    totalPrice,
  }
}

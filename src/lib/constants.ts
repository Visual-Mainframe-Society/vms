export const COMMISSION_RATE = 0.3

export const calcArtistReceives = (price: number): number =>
  Math.round(price * (1 - COMMISSION_RATE))

export const calcCommission = (price: number): number => Math.round(price * COMMISSION_RATE)

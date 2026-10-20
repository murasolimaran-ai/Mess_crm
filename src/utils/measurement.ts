import { MeasurementType, ServingConversion } from '../types';

/**
 * Calculates converted measurement for reporting:
 * - Weight: grams -> converts to kg when >= 1000g (e.g. 10.5 kg)
 * - Pieces: piece count (e.g. 420 pieces)
 * - Eggs: count of eggs consumed (e.g. 64 eggs)
 * - Cups: count of cups dispensed (e.g. 95 cups)
 */
export function formatConvertedMeasurement(
  measurementType: MeasurementType,
  totalPortions: number,
  conversion: ServingConversion
): string {
  const totalValue = totalPortions * conversion.multiplier;

  switch (measurementType) {
    case 'weight':
      if (totalValue >= 1000) {
        return `${(totalValue / 1000).toFixed(2)} kg (${totalValue.toLocaleString()} g)`;
      }
      return `${totalValue.toLocaleString()} g`;

    case 'pieces':
      return `${totalValue.toLocaleString()} pcs (${totalPortions} servings × ${conversion.multiplier})`;

    case 'eggs':
      return `${totalValue.toLocaleString()} eggs`;

    case 'cups':
      return `${totalValue.toLocaleString()} cups`;

    case 'servings':
    default:
      return `${totalPortions.toLocaleString()} portions`;
  }
}

export function getShortUnitLabel(measurementType: MeasurementType, conversion: ServingConversion): string {
  switch (measurementType) {
    case 'weight':
      return `${conversion.multiplier}g`;
    case 'pieces':
      return `${conversion.multiplier} pcs`;
    case 'eggs':
      return `${conversion.multiplier} egg${conversion.multiplier > 1 ? 's' : ''}`;
    case 'cups':
      return '1 cup';
    default:
      return '1 plate';
  }
}

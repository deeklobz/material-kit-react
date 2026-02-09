/**
 * Kenyan Rental Tax Calculator Service
 * Handles MRI (Monthly Rental Income tax), Annual tax, and Withholding tax calculations
 */

export interface TaxCalculationInput {
  monthlyRent: number;
  annualRent?: number;
  additionalCharges?: number;
  deductibleExpenses?: number;
  propertyType: 'residential' | 'commercial';
  isTenantWithholdingAgent?: boolean;
  isNonResident?: boolean;
}

export interface TaxCalculationResult {
  method: 'mri' | 'annual' | 'withholding';
  taxableAmount: number;
  taxAmount: number;
  taxRate: number;
  netIncome: number;
  description: string;
  notes: string[];
}

export const TAX_CONSTANTS = {
  // MRI (Monthly Rental Income Tax)
  MRI_RATE: 0.075, // 7.5%
  MRI_ANNUAL_MIN: 288000, // KSh 288,000/year
  MRI_ANNUAL_MAX: 15000000, // KSh 15,000,000/year
  MRI_MONTHLY_MIN: 24000, // KSh 24,000/month
  MRI_MONTHLY_MAX: 1250000, // KSh 1,250,000/month

  // Withholding Tax
  WITHHOLDING_RESIDENT: 0.10, // 10% for residents
  WITHHOLDING_NON_RESIDENT: 0.30, // 30% for non-residents

  // Annual graduated rates (simplified - individual rates)
  ANNUAL_TAX_BRACKETS: [
    { min: 0, max: 288000, rate: 0 },
    { min: 288001, max: 388000, rate: 0.10 },
    { min: 388001, max: 520000, rate: 0.15 },
    { min: 520001, max: 748000, rate: 0.20 },
    { min: 748001, max: 1100000, rate: 0.25 },
    { min: 1100001, max: Infinity, rate: 0.30 },
  ],

  CORPORATE_RATE: 0.30, // 30% for companies
};

/**
 * Determine which tax method applies
 */
export function determineTaxMethod(
  monthlyRent: number,
  isNonResident: boolean = false
): 'mri' | 'annual' | 'withholding' {
  if (isNonResident) {
    return 'withholding';
  }

  const annualRent = monthlyRent * 12;

  if (
    annualRent >= TAX_CONSTANTS.MRI_ANNUAL_MIN &&
    annualRent <= TAX_CONSTANTS.MRI_ANNUAL_MAX &&
    monthlyRent >= TAX_CONSTANTS.MRI_MONTHLY_MIN &&
    monthlyRent <= TAX_CONSTANTS.MRI_MONTHLY_MAX
  ) {
    return 'mri';
  }

  return 'annual';
}

/**
 * Calculate MRI (Monthly Rental Income Tax)
 * - Applies to residents with monthly rent between KSh 24,000-1,250,000
 * - Tax is 7.5% of gross rent
 * - Cannot deduct expenses
 * - Treated as final tax
 */
export function calculateMRITax(monthlyRent: number): TaxCalculationResult {
  const taxAmount = monthlyRent * TAX_CONSTANTS.MRI_RATE;
  const netIncome = monthlyRent - taxAmount;

  return {
    method: 'mri',
    taxableAmount: monthlyRent,
    taxAmount,
    taxRate: TAX_CONSTANTS.MRI_RATE,
    netIncome,
    description: 'MRI (Monthly Rental Income Tax)',
    notes: [
      `Tax is 7.5% of gross rent (${monthlyRent.toLocaleString('en-KE', { style: 'currency', currency: 'KES' })})`,
      'No deduction of expenses allowed',
      'Treated as final tax - not included in annual return',
      'Must be filed and paid by 20th of following month',
    ],
  };
}

/**
 * Calculate Annual Tax (Standard Regime)
 * - Applies if annual rent is <KSh 288,000 or >KSh 15,000,000
 * - Tax on net income (after deducting allowable expenses)
 * - Uses graduated tax brackets
 */
export function calculateAnnualTax(
  monthlyRent: number,
  deductibleExpenses: number = 0,
  isCompany: boolean = false
): TaxCalculationResult {
  const annualRent = monthlyRent * 12;
  const netIncome = annualRent - deductibleExpenses;
  const taxableIncome = Math.max(0, netIncome);

  let taxAmount = 0;

  if (isCompany) {
    // Companies taxed at flat 30% rate
    taxAmount = taxableIncome * TAX_CONSTANTS.CORPORATE_RATE;
  } else {
    // Individuals taxed at graduated rates
    for (const bracket of TAX_CONSTANTS.ANNUAL_TAX_BRACKETS) {
      if (taxableIncome > bracket.max) {
        taxAmount += (bracket.max - bracket.min) * bracket.rate;
      } else if (taxableIncome > bracket.min) {
        taxAmount += (taxableIncome - bracket.min) * bracket.rate;
        break;
      }
    }
  }

  const effectiveRate = taxableIncome > 0 ? taxAmount / taxableIncome : 0;

  return {
    method: 'annual',
    taxableAmount: taxableIncome,
    taxAmount,
    taxRate: effectiveRate,
    netIncome: netIncome - taxAmount,
    description: 'Annual Rental Income Tax (Standard Regime)',
    notes: [
      `Annual rent: ${annualRent.toLocaleString('en-KE', { style: 'currency', currency: 'KES' })}`,
      `Deductible expenses: ${deductibleExpenses.toLocaleString('en-KE', { style: 'currency', currency: 'KES' })}`,
      `Taxable income: ${taxableIncome.toLocaleString('en-KE', { style: 'currency', currency: 'KES' })}`,
      `Expenses can include: repairs, agent fees, insurance, loan interest, property tax`,
      'Included in annual income tax return',
    ],
  };
}

/**
 * Calculate Withholding Tax
 * - Deducted at source by tenant (if withholding agent)
 * - 10% for residents, 30% for non-residents
 * - Can be used as credit in MRI or annual return
 */
export function calculateWithholdingTax(
  monthlyRent: number,
  isNonResident: boolean = false
): TaxCalculationResult {
  const rate = isNonResident
    ? TAX_CONSTANTS.WITHHOLDING_NON_RESIDENT
    : TAX_CONSTANTS.WITHHOLDING_RESIDENT;

  const taxAmount = monthlyRent * rate;
  const netIncome = monthlyRent - taxAmount;

  return {
    method: 'withholding',
    taxableAmount: monthlyRent,
    taxAmount,
    taxRate: rate,
    netIncome,
    description: `Withholding Tax (${isNonResident ? 'Non-Resident' : 'Resident'})`,
    notes: [
      `Deducted at source by tenant: ${rate * 100}% of gross rent`,
      `Tenant must be KRA-registered withholding agent`,
      isNonResident
        ? 'Final tax for non-residents'
        : 'Can be used as credit in MRI or annual return for residents',
      `Tenant must provide withholding certificate (form P4 or equivalent)`,
    ],
  };
}

/**
 * Calculate comprehensive tax based on invoice details
 */
export function calculateInvoiceTax(input: TaxCalculationInput): TaxCalculationResult {
  const taxMethod = determineTaxMethod(input.monthlyRent, input.isNonResident);

  if (taxMethod === 'mri') {
    return calculateMRITax(input.monthlyRent);
  }

  if (taxMethod === 'withholding' && input.isTenantWithholdingAgent) {
    return calculateWithholdingTax(input.monthlyRent, input.isNonResident);
  }

  // Default to annual tax
  return calculateAnnualTax(
    input.monthlyRent,
    input.deductibleExpenses || 0,
    input.propertyType === 'commercial'
  );
}

/**
 * Get tax recommendations based on income level
 */
export function getTaxRecommendations(monthlyRent: number): string[] {
  const annualRent = monthlyRent * 12;
  const recommendations: string[] = [];

  if (annualRent >= TAX_CONSTANTS.MRI_ANNUAL_MIN && annualRent <= TAX_CONSTANTS.MRI_ANNUAL_MAX) {
    recommendations.push('✅ You qualify for MRI - simpler tax filing with 7.5% rate');
    recommendations.push('📌 MRI is a final tax - file monthly returns by 20th of next month');
  } else if (annualRent < TAX_CONSTANTS.MRI_ANNUAL_MIN) {
    recommendations.push('✅ Income below MRI threshold - use annual tax with expense deductions');
    recommendations.push('💡 You can deduct repairs, agent fees, insurance, loan interest');
  } else if (annualRent > TAX_CONSTANTS.MRI_ANNUAL_MAX) {
    recommendations.push('✅ High income - use annual tax with full expense deductions');
    recommendations.push('💡 Consider professional tax planning for large property portfolios');
  }

  recommendations.push('📅 Keep records of all rental income and deductible expenses');
  recommendations.push('⚠️ Consult with a tax professional for your specific situation');

  return recommendations;
}

/**
 * Format tax details for display
 */
export function formatTaxSummary(result: TaxCalculationResult): string {
  return `
${result.description}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Taxable Amount: KSh ${result.taxableAmount.toLocaleString()}
Tax Rate: ${(result.taxRate * 100).toFixed(2)}%
Tax Amount: KSh ${result.taxAmount.toLocaleString()}
Net Income: KSh ${result.netIncome.toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${result.notes.map((note) => `• ${note}`).join('\n')}
  `.trim();
}

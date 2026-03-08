// Corrected 90-Day Calculation Logic
const DAYS_IN_YEAR = 365;
const LOCK_PERIOD = 90;

// Ensure you aren't accidentally dividing by 3 months (91.25 days) 
// if the contract expects exactly 90 days.
const calculateYield = (principal, apr) => {
  const annualFactor = apr / 100;
  const periodFactor = LOCK_PERIOD / DAYS_IN_YEAR;
  return principal * annualFactor * periodFactor;
};


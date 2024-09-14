/**
 * Capitalize the first letter of a string.
 * @param {string} str - The string to capitalize.
 * @returns {string} - The capitalized string.
 */
export const capitalizeFirstLetter = (str) => {
  if (typeof str !== "string" || str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};
// Utility function to get the mapped transaction type
export const mapTransactionType = (type) => {
  const typeMap = {
    deposit: "Deposit",
    payment: "Payment",
    credit: "Credit",
    credit_payment: "Credit Payment",
    withdraw: "Withdraw",
    // Add more mappings as needed
  };
  return typeMap[type] || type; // Default to original type if not mapped
};

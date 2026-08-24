export const getTimeZoneByLocation = (location?: string | null): string => {
  const value = location?.toLowerCase().trim() || "";

  // Cameroon
  if (
    value.includes("cameroon") ||
    value.includes("douala") ||
    value.includes("bonaberi")
  ) {
    return "Africa/Douala";
  }

  // USA / Ohio
  if (
    value.includes("usa") ||
    value.includes("united states") ||
    value.includes("ohio") ||
    value.includes("reynoldsburg")
  ) {
    return "America/New_York";
  }

  // Default
  return "America/New_York";
};

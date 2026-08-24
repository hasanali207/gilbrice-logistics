/**
 * Generate backend payload for updating a transaction
 * @param editData Transaction object being edited
 * @param editItems Array of edited items
 */
export const generateTransactionPayload = (editData: any, editItems: any[]) => {
  if (!editData || !editData.source) return { items: [] };

  const items = editItems.map((i) => {
    const amount = Number(i.amount || 0);

    switch (editData.source) {
      case "STUDENT":
        return {
          paymentItemId: i.paymentItemId,
          amount,
        };

      case "DONATION":
        return {
          donationItemId: i.donationItemId,
          title: i.donationItem?.title || i.title,
          amount,
        };

      case "MONTHLY_DONATION":
        return {
          monthlyInvoiceId: i.monthlyInvoiceId,
          amount,
        };

      default:
        return i;
    }
  });

  return { items };
};

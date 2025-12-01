export interface BillByteMenu {
  itemId?: number;
  itemName: string;
  itemTypeId?: number;
  itemCost: number;
  gstPercentage?: number;
  cgstPercentage?: number;
  createdDate?: string;
  imageUrl?: string;
  createdBy?: string;
  foodTypeName?: string; // optional for display
}

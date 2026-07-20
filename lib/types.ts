export type CustomDesign = {
  text?: string;
  textColor?: string;
  font?: string;
  /** Server-persisted upload path, e.g. /uploads/designs/uuid.png */
  imageUrl?: string;
  /** Ephemeral base64 preview (never persisted to localStorage) */
  imageDataUrl?: string;
  posX: number;
  posY: number;
  scale: number;
  rotation: number;
};

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  qty: number;
  size: string;
  color: string;
  colorHex: string;
  fabricHex: string;
  category?: string;
  thumbnailDataUrl?: string;
  custom?: CustomDesign;
};

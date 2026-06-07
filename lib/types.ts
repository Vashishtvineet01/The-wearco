export type CustomDesign = {
  // Print specifications captured from the Design Studio
  text?: string;
  textColor?: string;
  font?: string;
  imageDataUrl?: string;
  // Position of design on canvas (% of print area)
  posX: number;
  posY: number;
  scale: number;
  rotation: number;
};

export type CartItem = {
  id: string; // unique id per cart line
  slug: string;
  name: string;
  price: number;
  qty: number;
  size: string;
  color: string;
  colorHex: string;
  fabricHex: string;
  thumbnailDataUrl?: string;
  custom?: CustomDesign;
};

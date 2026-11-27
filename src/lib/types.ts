/**
 * Tipos centrais do sistema: produto, pedido, contato, universidade, configurações e o
 * formato do banco (DB).
 */
export type Size = "PP" | "P" | "M" | "G" | "GG" | "XG" | "U";
export const SIZES: Size[] = ["PP", "P", "M", "G", "GG", "XG", "U"];
export const sizeLabel = (s: string) => (s === "U" ? "Único" : s);

export type Category = "Moletom" | "Camiseta" | "Polo" | "Jaqueta" | "Boné" | "Touca" | "Regata" | "Short" | "Cropped";
export const CATEGORIES: Category[] = ["Moletom", "Camiseta", "Polo", "Jaqueta", "Boné", "Touca", "Regata", "Short", "Cropped"];

export type Discount = { type: "percent" | "fixed"; value: number } | null;

export type University = {
  id: string;
  name: string; // sigla exibida (USP)
  fullName: string;
  color: string; // cor do bordado
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  universityId: string;
  category: Category;
  price: number; // em reais
  discount: Discount;
  sizes: Size[];
  stock: Partial<Record<Size, number>>;
  fabric: string; // cor do tecido
  image?: string; // foto principal
  images?: string[]; // galeria (ex.: frente e costas)
  active: boolean;
  createdAt: string;
};

export type OrderItem = {
  productId: string;
  name: string;
  universityId: string;
  size: Size;
  qty: number;
  unitPrice: number;
};

export type Address = { cep: string; street: string; number: string; complement: string; district: string; city: string; uf: string };

export type Subscriber = { email: string; createdAt: string; consentAt: string };

export type OrderStatus = "pending" | "paid" | "cancelled";

export type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  customer: { name: string; email: string; phone: string };
  address?: Address;
  shipping?: { service: string; price: number; prazo: string };
  items: OrderItem[];
  subtotal?: number;
  total: number;
  mpPreferenceId?: string;
  mpPaymentId?: string;
  demo?: boolean;
};

export type Contact = {
  id: string;
  kind?: "atletica" | "geral";
  subject?: string;
  order?: string;
  consentAt?: string;
  createdAt: string;
  athletic: string;
  university: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  instagram: string;
  members: string;
  message: string;
  emailStatus: "sent" | "queued" | "failed";
  read: boolean;
};

export type Settings = {
  contactEmail: string;
  storeName: string;
};

export type DB = {
  universities: University[];
  products: Product[];
  orders: Order[];
  contacts: Contact[];
  newsletter?: Subscriber[];
  settings: Settings;
};

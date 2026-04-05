import { CartProvider } from "./CartContext";

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

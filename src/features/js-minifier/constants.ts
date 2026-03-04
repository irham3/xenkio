import { IndentSize, JsMinifierOptions } from './types';

export const INDENT_SIZES: { id: IndentSize; label: string }[] = [
  { id: 2, label: '2' },
  { id: 4, label: '4' },
  { id: 8, label: '8' },
];

export const DEFAULT_OPTIONS: JsMinifierOptions = {
  js: '',
  indentSize: 2,
};

export const SAMPLE_JS = `/**
 * Shopping Cart Module
 * Handles cart operations and calculations
 */
class ShoppingCart {
  constructor() {
    this.items = [];
    this.discount = 0;
  }

  // Add an item to the cart
  addItem(name, price, quantity) {
    const existing = this.items.find(item => item.name === name);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({ name, price, quantity });
    }
    return this;
  }

  // Remove an item by name
  removeItem(name) {
    this.items = this.items.filter(item => item.name !== name);
    return this;
  }

  /* Calculate the subtotal before discount */
  getSubtotal() {
    return this.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
  }

  /**
   * Apply a percentage discount
   * @param {number} percent - Discount percentage (0-100)
   */
  applyDiscount(percent) {
    if (percent < 0 || percent > 100) {
      throw new Error("Discount must be between 0 and 100");
    }
    this.discount = percent;
  }

  // Get the final total with discount applied
  getTotal() {
    const subtotal = this.getSubtotal();
    const discountAmount = subtotal * (this.discount / 100);
    return subtotal - discountAmount;
  }

  // Format price as currency string
  formatPrice(amount) {
    return "$" + amount.toFixed(2);
  }

  // Get a summary of the cart
  getSummary() {
    const summary = {
      itemCount: this.items.length,
      subtotal: this.formatPrice(this.getSubtotal()),
      discount: this.discount + "%",
      total: this.formatPrice(this.getTotal()),
    };
    return summary;
  }
}

// Initialize and use the cart
function main() {
  const cart = new ShoppingCart();

  cart.addItem("Widget", 9.99, 3);
  cart.addItem("Gadget", 24.95, 1);
  cart.addItem("Doohickey", 4.50, 5);

  cart.applyDiscount(10);

  console.log("Cart Summary:", cart.getSummary());
}

main();`;

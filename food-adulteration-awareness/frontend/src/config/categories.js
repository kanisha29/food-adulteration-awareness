export const CATEGORY_ICONS = {
  Dairy: "🥛", Spices: "🌶️", Beverages: "☕", Sweeteners: "🍯", "Oils & Fats": "🧈",
  "Grains & Pulses": "🌾", Sweets: "🍬", Essentials: "🧂",
};
export const iconFor = (c) => CATEGORY_ICONS[c] || "🍽️";
export const STATUS = { pending: "Pending", in_review: "In review", resolved: "Resolved" };
export const STATUS_COLORS = { pending: "#f28c28", in_review: "#3b82f6", resolved: "#2f9e63" };
export const TIPS = [
  ["Read the label", "Check the FSSAI licence number, batch number and expiry date before buying."],
  ["Buy whole, grind fresh", "Whole spices and grains are harder to adulterate than powders."],
  ["Beware of bargains", "Prices far below the market rate can signal cheap fillers or substitutes."],
  ["Store it right", "Airtight, dry containers keep food fresh and reduce contamination."],
];

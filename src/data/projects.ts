export type Project = {
  id: string;
  title: string;
  lead: string;
  body: string;
  tags: string[];
  url?: string;
  theme: "blue" | "pink" | "lime";
  layout: "demo-left" | "demo-right";
};

export const projects: Project[] = [
  {
    id: "kiima",
    title: "KIIMA Dynamic Bundle Builder",
    lead: "Turning a bundle-based product offering into an intuitive subscription experience.",
    body: "KIIMA needed a flexible way for customers to build personalized bundles and subscribe through Recharge. I led the UX research, interface design, and development of a custom bundle builder, allowing customers to configure their own selections before seamlessly entering Recharge's subscription workflow.",
    tags: ["JavaScript", "Recharge", "Shopify Functions", "Liquid", "HTML", "SCSS", "AJAX"],
    theme: "blue",
    layout: "demo-left",
  },
  {
    id: "baffin-gwp",
    title: "Baffin Gift with Purchase App",
    lead: "Replacing promotional limitations with a solution built around the business.",
    body: "Baffin's existing third-party GWP apps limited promotional flexibility and storefront customization, particularly during high-volume campaigns like Black Friday and Cyber Monday. I designed and built a custom Shopify solution combining a Discount app extension with storefront logic, giving the team control over three promotion types: spend-based, product-based, and collection-based gifts.",
    tags: [
      "JavaScript",
      "TypeScript",
      "Shopify Functions",
      "Liquid",
      "HTML",
      "SCSS",
      "AJAX",
      "Shopify APIs",
    ],
    theme: "pink",
    layout: "demo-right",
  },
  {
    id: "baffin-cart",
    title: "Baffin Cart Refactor",
    lead: "Making a complex cart easier to maintain, extend, and scale.",
    body: "As Baffin's AJAX cart grew in complexity and they were heading towards more custom app integration, I led an architectural refactor, breaking the cart into independent web components, a centralized Cart Conductor, app-specific managers, and modular AJAX templates.",
    tags: ["JavaScript", "Liquid", "AJAX", "Shopify APIs", "Cursor"],
    theme: "lime",
    layout: "demo-left",
  },
];

export const linkedInUrl = "";
export const emailAddress = "katie.lee9912@gmail.com";

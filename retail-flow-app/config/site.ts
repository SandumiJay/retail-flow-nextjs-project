import Inventory from "@/app/Inventory/inventory/inventory";
import { button } from "@nextui-org/theme";

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Next.js + NextUI",
  description: "Make beautiful websites regardless of your design experience.",
  navItems: [
    {
      label: "Home",
      href: "/home",
    },
    {
      label: "Inventory",
      href: "/Inventory",
      submenu: [
        {
          label: "Products",
          href: "/products",
        },
        {
          label: "Product Categories",
          href: "/products-categories",
        },
        {
          label: "Purchase Order", 
          href: "/purchase-order",
        },
        {
          label: "Supplier",
          href: "/supplier",
        },
        {
          label: "Inventory", 
          href: "/inventory",
        },
      ],
    },
    {
      label: "POS",
      href: "/POS",
    },
    {
      label: "Customer",
      href: "/customer",
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback",
    },
    {
      label: "Logout",
      href: "/",
    },
  ],
  links: {
    github: "https://github.com/nextui-org/nextui",
    twitter: "https://twitter.com/getnextui",
    docs: "https://nextui.org",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
  button: {
    href: "/auth",
  },
};
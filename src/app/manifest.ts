import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Meridian Studio OS",
    short_name: "Meridian",
    description:
      "Creative studio resource and production workspace for projects, deliverables, capacity, and team planning.",
    start_url: "/",
    display: "standalone",
    background_color: "#0E0E11",
    theme_color: "#0E0E11",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

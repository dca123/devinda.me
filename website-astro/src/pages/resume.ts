import type { APIRoute } from "astro";
import { readFileSync } from "fs";

export const GET: APIRoute = () => {
  const file = readFileSync("./src/resume.pdf");
  return new Response(file, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename='resume.pdf'",
    },
  });
};

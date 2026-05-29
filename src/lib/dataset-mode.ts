import { z } from "zod";
import { fallback } from "@tanstack/zod-adapter";

export const datasetModeSchema = z.object({
  ds: fallback(z.enum(["messy", "clean"]), "clean").default("clean"),
});

export type DatasetMode = "messy" | "clean";

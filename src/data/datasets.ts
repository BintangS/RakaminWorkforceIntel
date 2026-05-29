import cleanJson from "./dataset_clean.json";
import messyJson from "./dataset_messy.json";
import type { EmployeeClean, EmployeeMessy } from "./types";

export const DB: EmployeeClean[] = cleanJson as EmployeeClean[];
export const DA: EmployeeMessy[] = messyJson as EmployeeMessy[];

export function reviewQueueCount(): number {
  return DB.filter((r) => r.needs_human_review).length;
}

export function findEmployee(id: string): EmployeeClean | undefined {
  return DB.find((r) => r.rakamin_id === id);
}

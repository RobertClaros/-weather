import type { IssPosition } from "../types/iss.js";

export interface IssDataPort {
  getCurrentPosition(): Promise<IssPosition | null>;
}
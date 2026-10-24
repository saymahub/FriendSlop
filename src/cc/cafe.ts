import { CAFE } from './config';

export type Customer = {
  id: number;
  /** Which customer picture to show. */
  look: string;
  /** The drink they ordered. */
  wants: string;
  arrivedAt: number;
};

export function newCustomer(id: number, looks: readonly string[], drinks: readonly string[], now: number): Customer {
  const pick = (from: readonly string[]) => from[Math.floor(Math.random() * from.length)];
  return { id, look: pick(looks), wants: pick(drinks), arrivedAt: now };
}

/** How much of their patience is left, from 1 when they walk in to 0 when they leave. */
export function patienceLeft(customer: Customer, now: number): number {
  return Math.max(0, 1 - (now - customer.arrivedAt) / CAFE.patienceMs);
}

/** The base tip, plus a bonus that shrinks the longer they waited, rounded to whole coins. */
export function tipFor(customer: Customer, now: number): number {
  return Math.round(CAFE.baseTip + CAFE.speedBonus * patienceLeft(customer, now));
}

/** The longest-waiting customer who ordered this drink, if anyone did. */
export function whoOrdered(customers: readonly Customer[], drink: string): Customer | undefined {
  return customers.find((customer) => customer.wants === drink);
}

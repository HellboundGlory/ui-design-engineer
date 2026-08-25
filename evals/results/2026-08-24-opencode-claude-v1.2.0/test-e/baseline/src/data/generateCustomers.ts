import type { Customer, CustomerStatus, PlanTier, Region } from '../types'

// Deterministic PRNG (mulberry32) so the mock dataset is stable across
// reloads within a session rather than reshuffling on every render.
function mulberry32(seed: number) {
  let a = seed
  return function random() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20260825)

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)]
}

function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min
}

const FIRST_NAMES = [
  'Alicia', 'Marcus', 'Priya', 'Tomás', 'Ingrid', 'Chen', 'Fatima', 'Declan',
  'Yuki', 'Sven', 'Naledi', 'Renata', 'Omar', 'Sofia', 'Ravi', 'Camille',
  'Jonas', 'Aiko', 'Kwame', 'Elin', 'Diego', 'Meera', 'Liam', 'Noor',
  'Hana', 'Piotr', 'Zara', 'Theo', 'Amara', 'Lucas',
]

const LAST_NAMES = [
  'Whitfield', 'Nakamura', 'Okafor', 'Bergström', 'Alvarado', 'Kowalski',
  'Desai', 'Fontaine', 'Bracken', 'Osei', 'Lindqvist', 'Mercer', 'Abadi',
  'Sørensen', 'Vasquez', 'Iyer', 'Novak', 'Farrow', 'Haddad', 'Lindgren',
]

const COMPANY_PREFIXES = [
  'North', 'Summit', 'Cobalt', 'Vertex', 'Anchor', 'Lattice', 'Harbor',
  'Beacon', 'Ridge', 'Foundry', 'Meridian', 'Cascade', 'Ironwood', 'Solstice',
  'Granite', 'Delta', 'Pinnacle', 'Outland', 'Sterling', 'Quarry',
]

const COMPANY_SUFFIXES = [
  'Logistics', 'Health Systems', 'Robotics', 'Analytics', 'Freight',
  'Financial', 'Biotech', 'Energy', 'Retail Group', 'Manufacturing',
  'Media', 'Insurance', 'Aerospace', 'Foods', 'Materials', 'Networks',
  'Capital', 'Dynamics', 'Industries', 'Technologies',
]

const STATUSES: CustomerStatus[] = ['active', 'active', 'active', 'active', 'trial', 'past_due', 'suspended', 'churned']
const PLANS: PlanTier[] = ['starter', 'growth', 'growth', 'enterprise', 'enterprise_plus']
const REGIONS: Region[] = ['na', 'emea', 'apac', 'latam']

const OWNERS = [
  'D. Alvarez', 'S. Wren', 'K. Boateng', 'M. Ostrowski', 'J. Lindqvist',
  'R. Chowdhury', 'T. Halvorsen', 'P. Anand',
]

function daysAgoIso(days: number): string {
  const d = new Date('2026-08-25T09:00:00Z')
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString().slice(0, 10)
}

function planSeatRange(plan: PlanTier): [number, number] {
  switch (plan) {
    case 'starter':
      return [5, 25]
    case 'growth':
      return [20, 120]
    case 'enterprise':
      return [80, 600]
    case 'enterprise_plus':
      return [400, 2500]
  }
}

function planMrrBase(plan: PlanTier): [number, number] {
  switch (plan) {
    case 'starter':
      return [199, 900]
    case 'growth':
      return [900, 4500]
    case 'enterprise':
      return [4500, 22000]
    case 'enterprise_plus':
      return [20000, 96000]
  }
}

export function generateCustomers(count: number): Customer[] {
  const customers: Customer[] = []
  const usedCompanyNames = new Set<string>()

  for (let i = 0; i < count; i++) {
    let company = `${pick(COMPANY_PREFIXES)} ${pick(COMPANY_SUFFIXES)}`
    while (usedCompanyNames.has(company)) {
      company = `${pick(COMPANY_PREFIXES)} ${pick(COMPANY_SUFFIXES)}`
    }
    usedCompanyNames.add(company)

    const status = pick(STATUSES)
    const plan = pick(PLANS)
    const [seatMin, seatMax] = planSeatRange(plan)
    const seats = randInt(seatMin, seatMax)
    const seatsUsed =
      status === 'churned'
        ? 0
        : Math.min(seats, Math.round(seats * (0.35 + rand() * 0.6)))
    const [mrrMin, mrrMax] = planMrrBase(plan)
    const mrr = status === 'churned' ? 0 : randInt(mrrMin, mrrMax)

    const firstName = pick(FIRST_NAMES)
    const lastName = pick(LAST_NAMES)
    const domain = company
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 14)

    const healthScore =
      status === 'churned'
        ? randInt(0, 25)
        : status === 'suspended'
          ? randInt(5, 35)
          : status === 'past_due'
            ? randInt(20, 55)
            : status === 'trial'
              ? randInt(30, 80)
              : randInt(45, 100)

    const createdDaysAgo = randInt(30, 1460)
    const lastActivityDaysAgo =
      status === 'churned'
        ? randInt(createdDaysAgo - 300 > 0 ? Math.min(200, createdDaysAgo) : 30, Math.min(createdDaysAgo, 400))
        : status === 'suspended'
          ? randInt(14, 90)
          : randInt(0, 21)

    customers.push({
      id: `CUS-${String(10000 + i)}`,
      company,
      contactName: `${firstName} ${lastName}`,
      contactEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}.com`,
      status,
      plan,
      mrr,
      seats,
      seatsUsed,
      region: pick(REGIONS),
      owner: pick(OWNERS),
      healthScore,
      createdAt: daysAgoIso(createdDaysAgo),
      lastActivityAt: daysAgoIso(Math.min(lastActivityDaysAgo, createdDaysAgo)),
    })
  }

  return customers
}

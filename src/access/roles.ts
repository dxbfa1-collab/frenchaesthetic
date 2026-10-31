import type { Access, FieldAccess } from 'payload'

import { isStaging } from '../lib/site'

/** Staff roles from the brief (§8): the owner can do everything; the others see their own area. */
export const ROLES = ['owner', 'clinicCoordinator', 'academyCoordinator', 'editor'] as const
export type Role = (typeof ROLES)[number]

export const ROLE_OPTIONS: { label: string; value: Role }[] = [
  { label: 'Owner (everything)', value: 'owner' },
  { label: 'Clinic coordinator (bookings, clinic content)', value: 'clinicCoordinator' },
  { label: 'Academy coordinator (enrollments, batches, courses)', value: 'academyCoordinator' },
  { label: 'Editor (posts and page text)', value: 'editor' },
]

export function hasRole(user: unknown, ...roles: Role[]): boolean {
  const userRoles = (user as { roles?: unknown } | null | undefined)?.roles
  return Array.isArray(userRoles) && userRoles.some((r) => roles.includes(r as Role))
}

export const anyone: Access = () => true

export const isStaff: Access = ({ req }) => Boolean(req.user)

/** The public API serves what the live site shows: unconfirmed records stay with staff (and staging). */
export const confirmedOrStaff =
  (field = 'status'): Access =>
  ({ req }) =>
    req.user || isStaging ? true : { [field]: { equals: 'confirmed' } }

/** Brief §5 and §9: a treatment is public only when it is Ready and a doctor has signed it off. */
export const liveTreatmentOrStaff: Access = ({ req }) =>
  req.user || isStaging
    ? true
    : { contentStatus: { equals: 'ready' }, medicalSignOff: { equals: true } }

export const isOwner: Access = ({ req }) => hasRole(req.user, 'owner')

/** The owner always passes; the listed roles pass too. */
export const ownerOr =
  (...roles: Role[]): Access =>
  ({ req }) =>
    hasRole(req.user, 'owner', ...roles)

/** Owners see every user; everyone else sees only their own account. */
export const ownerOrSelf: Access = ({ req }) => {
  if (hasRole(req.user, 'owner')) return true
  return req.user ? { id: { equals: req.user.id } } : false
}

export const ownerField: FieldAccess = ({ req }) => hasRole(req.user, 'owner')

export const staffField: FieldAccess = ({ req }) => Boolean(req.user)

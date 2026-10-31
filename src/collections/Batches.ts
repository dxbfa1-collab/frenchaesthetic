import type {
  CollectionBeforeChangeHook,
  CollectionConfig,
  DateFieldValidation,
  FieldHook,
} from 'payload'

import { confirmedOrStaff, ownerOr } from '../access/roles'
import { factStatusField, internalNoteField } from '../fields/shared'
import { revalidateSite } from '../hooks/revalidate'
import { followsStartRule, formatBatchDate, normalizeDay, ordinal } from '../lib/batches'
import { relationId } from '../lib/relation'

const pinToDay: FieldHook = ({ value }) => normalizeDay(value)

/** The start date must be the course's start day (or the Monday after, when that is a Sunday). */
const validateStartDate: DateFieldValidation = async (value, { req, siblingData }) => {
  if (!value) return 'Pick the start date.'
  const data = siblingData as { course?: unknown; ruleException?: boolean }
  const courseId = relationId(data.course)
  if (data.ruleException || !courseId) return true
  try {
    const course = await req.payload.findByID({
      collection: 'courses',
      id: courseId,
      depth: 0,
      req,
    })
    if (!course.batchStartDay || followsStartRule(value, course.batchStartDay)) return true
    return `${course.shortName} batches start on the ${ordinal(course.batchStartDay)} of the month (or the Monday after, when that is a Sunday). Tick "Exception to the start-day rule" to use another date.`
  } catch {
    return true
  }
}

const setTitle: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const courseId = relationId(data.course ?? originalDoc?.course)
  const startDate = data.startDate ?? originalDoc?.startDate
  if (!courseId || !startDate) return data
  const course = await req.payload.findByID({ collection: 'courses', id: courseId, depth: 0, req })
  data.title = `${course.shortName} · ${formatBatchDate(startDate)}`
  return data
}

const dayOnly = { pickerAppearance: 'dayOnly' as const, displayFormat: 'EEE d MMM yyyy' }

/** Academy batches: the calendar, the course pages and the enrollment form all read from here. */
export const Batches: CollectionConfig = {
  slug: 'batches',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'campus', 'seatsTaken', 'totalSeats', 'status', 'factStatus'],
    group: 'Academy',
  },
  access: {
    read: confirmedOrStaff('factStatus'),
    create: ownerOr('academyCoordinator'),
    update: ownerOr('academyCoordinator'),
    delete: ownerOr(),
  },
  defaultSort: 'startDate',
  hooks: {
    beforeChange: [setTitle],
    afterChange: [({ req }) => revalidateSite(req)],
    afterDelete: [({ req }) => revalidateSite(req)],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: { readOnly: true, position: 'sidebar', description: 'Filled in automatically.' },
    },
    { name: 'course', type: 'relationship', relationTo: 'courses', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          required: true,
          hooks: { beforeValidate: [pinToDay] },
          validate: validateStartDate,
          admin: { width: '50%', date: dayOnly },
        },
        {
          name: 'endDate',
          type: 'date',
          hooks: { beforeValidate: [pinToDay] },
          admin: { width: '50%', date: dayOnly, description: 'Optional.' },
        },
      ],
    },
    {
      name: 'ruleException',
      label: 'Exception to the start-day rule',
      type: 'checkbox',
      admin: {
        description: 'Tick only when the owner has approved a different start date for this batch.',
      },
    },
    {
      name: 'campus',
      type: 'relationship',
      relationTo: 'branches',
      filterOptions: { business: { in: ['academy', 'both'] } },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'totalSeats',
          type: 'number',
          required: true,
          defaultValue: 20,
          min: 1,
          admin: { width: '33%' },
        },
        {
          name: 'seatsTaken',
          type: 'number',
          required: true,
          defaultValue: 0,
          min: 0,
          admin: {
            width: '33%',
            description:
              'Goes up by one when an online enrollment is confirmed. Add WhatsApp bookings by hand.',
          },
        },
        {
          name: 'showSeatsLeft',
          label: 'Show "seats left" on the site',
          type: 'checkbox',
          admin: { width: '33%', description: 'Only if admissions update the count every day.' },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'open',
      options: [
        { label: 'Open', value: 'open' },
        { label: 'Full', value: 'full' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: { position: 'sidebar' },
    },
    factStatusField('factStatus', 'Date and campus'),
    internalNoteField,
  ],
}

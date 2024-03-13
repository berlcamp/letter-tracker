import type { AccountTypes } from '@/types'
import { createBrowserClient } from '@supabase/ssr'
import { format } from 'date-fns'
// import { fullTextQuery } from './text-helper'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export interface DocumentFilterTypes {
  filterDate?: Date | undefined
  filterTypes?: any[]
  filterKeyword?: string
}

export async function fetchDocuments (filters: DocumentFilterTypes, perPageCount: number, rangeFrom: number) {
  try {
    let query = supabase
      .from('asenso_letter_trackers')
      .select('*, asenso_letter_tracker_stickies(*), asenso_users:user_id(*)', { count: 'exact' })

      // Full text search
    if (typeof filters.filterKeyword !== 'undefined' && filters.filterKeyword.trim() !== '') {
      query = query.or(`particulars.ilike.%${filters.filterKeyword}%`)
    }

    // Filter Date
    if (typeof filters.filterDate !== 'undefined') {
      query = query.gte('date_received', format(new Date(filters.filterDate), 'yyyy-MM-dd'))
    }

    // Filter type
    if (typeof filters.filterTypes !== 'undefined' && filters.filterTypes.length > 0) {
      const statement: string[] = []
      filters.filterTypes?.forEach((type: string) => {
        const str = `type.eq.${type}`
        statement.push(str)
      })
      query = query.or(statement.join(', '))
    }

    // Perform count before paginations
    // const { count } = await query

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)
    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, count, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch error xx', error)
    return { data: [], count: 0 }
  }
}

export async function fetchActivities (today: string, endDate: Date) {
  try {
    const { data, count, error } = await supabase
      .from('asenso_letter_trackers')
      .select('*', { count: 'exact' })
      .gte('activity_date', today)
      .lt('activity_date', endDate.toISOString())
      .order('activity_date', { ascending: true })
      .limit(30)

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch error', error)
    return { data: [], count: 0 }
  }
}

export async function fetchAccounts (filters: { filterStatus?: string }, perPageCount: number, rangeFrom: number) {
  try {
    let query = supabase
      .from('asenso_users')
      .select('*', { count: 'exact' })
      .neq('email', 'berlcamp@gmail.com')

    // filter status
    if (filters.filterStatus && filters.filterStatus !== '') {
      query = query.eq('status', filters.filterStatus)
    }

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data: userData, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    const data: AccountTypes[] = userData

    return { data, count }
  } catch (error) {
    console.error('fetch error', error)
    return { data: [], count: 0 }
  }
}

export async function logError (transaction: string, table: string, data: string, error: string) {
  await supabase
    .from('error_logs')
    .insert({
      system: 'agriko',
      transaction,
      table,
      data,
      error
    })
}

export async function fetchErrorLogs (perPageCount: number, rangeFrom: number) {
  try {
    let query = supabase
      .from('error_logs')
      .select('*', { count: 'exact' })

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch error logs error', error)
    return { data: [], count: 0 }
  }
}

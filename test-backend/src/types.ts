export type CustomerStatus = 'New' | 'Pending' | 'Completed' | 'Rejected'

export type InboxMessageType = 'News' | 'Notion' | 'Promotions'

export interface CustomerAddress {
  address1: string
  city: string
  country: string
  zipCode: string
}

export interface Customer {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  email: string
  phone: string
  status: CustomerStatus
  address: CustomerAddress
  notes: string
}

export interface CustomerSummary {
  id: string
  name: string
  email: string
  phone: string
  status: CustomerStatus
}

export interface DashboardStat {
  id: string
  label: string
  value: number
  delta: string
  trend: 'up' | 'down'
}

export interface DashboardMiniWidget {
  title: string
  value: string
  bars: number[]
  mainColor: string
  mutedColor: string
}

export interface DashboardIncomeSegment {
  label: string
  value: string
  color: string
}

export interface DashboardData {
  stats: DashboardStat[]
  chart: {
    months: string[]
    points: number[]
  }
  miniWidgets: DashboardMiniWidget[]
  incomeBreakdown: DashboardIncomeSegment[]
}

export interface InboxMessage {
  id: string
  name: string
  message: string
  date: string
  type: InboxMessageType
}

export interface CustomerFilters {
  search?: string
  status?: CustomerStatus
}

export interface InboxFilters {
  type?: InboxMessageType
}

export interface AppRepository {
  listCustomers(filters?: CustomerFilters): CustomerSummary[]
  getCustomerById(customerId: string): Customer | null
  deleteCustomerById(customerId: string): boolean
  getDashboard(): DashboardData
  listInboxMessages(filters?: InboxFilters): InboxMessage[]
}

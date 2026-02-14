import { v4 as uuidv4 } from 'uuid'
import {
  AppRepository,
  Customer,
  CustomerFilters,
  CustomerSummary,
  DashboardData,
  InboxFilters,
  InboxMessage,
} from '../types'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const CHART_POINTS = [64, 46, 52, 89, 71, 55, 73, 40, 32, 50, 31, 24]

const DASHBOARD_MINI_WIDGETS = [
  {
    title: 'HEALTH',
    value: '$ 4,682',
    bars: [18, 56, 42, 36, 46, 28],
    mainColor: '#63c6b2',
    mutedColor: '#bdebe3',
  },
  {
    title: 'FAMILY',
    value: '$ 124,063',
    bars: [18, 34, 52, 62, 54, 30],
    mainColor: '#4f66e7',
    mutedColor: '#dce2fb',
  },
  {
    title: 'RETIREMENT',
    value: '$ 632,023',
    bars: [14, 30, 58, 44, 30, 22],
    mainColor: '#e34a66',
    mutedColor: '#f2ccd6',
  },
  {
    title: 'EDUCATION',
    value: '$ 15,432',
    bars: [28, 56, 40, 34, 24, 8],
    mainColor: '#efb149',
    mutedColor: '#f3dfb8',
  },
]

const DASHBOARD_INCOME_BREAKDOWN = [
  { label: '$ 0 - $ 20,000', value: '20%', color: '#4a5be7' },
  { label: '$ 20,000 - $ 30,000', value: '25%', color: '#60c6b4' },
  { label: '$ 30,000 - $ 60,000', value: '40%', color: '#e35aa6' },
  { label: 'more than $ 60,000', value: '15%', color: '#f0b34f' },
]

const seededCustomers: Customer[] = [
  {
    id: 'isabelle-stanley',
    firstName: 'Isabelle',
    lastName: 'Stanley',
    dateOfBirth: '1992-04-14',
    email: 'stanley.i@hotmail.com',
    phone: '527-965-2636',
    status: 'New',
    address: {
      address1: '1124 Cedar Lake Road',
      city: 'Austin',
      country: 'United States',
      zipCode: '78701',
    },
    notes: 'Interested in retirement + education plans.',
  },
  {
    id: 'jone-blake',
    firstName: 'Jone',
    lastName: 'Blake',
    dateOfBirth: '1988-11-29',
    email: 'jone.blake@hotmail.com',
    phone: '849-795-2217',
    status: 'New',
    address: {
      address1: '89 Pine Street',
      city: 'Seattle',
      country: 'United States',
      zipCode: '98104',
    },
    notes: 'Requested follow-up call after first consultation.',
  },
  {
    id: 'jeanette-richardson',
    firstName: 'Jeanette',
    lastName: 'Richardson',
    dateOfBirth: '1990-08-06',
    email: 'jeanette.r@gmail.com',
    phone: '304-202-4876',
    status: 'Pending',
    address: {
      address1: '245 Maple Avenue',
      city: 'Denver',
      country: 'United States',
      zipCode: '80203',
    },
    notes: 'Waiting for identity verification documents.',
  },
  {
    id: 'cordelia-ferguson',
    firstName: 'Cordelia',
    lastName: 'Ferguson',
    dateOfBirth: '1985-02-19',
    email: 'ferguson.c@hotmail.com',
    phone: '936-112-9219',
    status: 'Completed',
    address: {
      address1: '701 Orchard View',
      city: 'San Diego',
      country: 'United States',
      zipCode: '92101',
    },
    notes: 'Completed onboarding and portfolio setup.',
  },
  {
    id: 'sylvia-west',
    firstName: 'Sylvia',
    lastName: 'West',
    dateOfBirth: '1995-12-03',
    email: 'west.sylvia@hotmail.com',
    phone: '643-648-9664',
    status: 'Rejected',
    address: {
      address1: '18 Holloway Street',
      city: 'Portland',
      country: 'United States',
      zipCode: '97205',
    },
    notes: 'Lead closed due to incomplete eligibility criteria.',
  },
]

const seededInboxMessages: InboxMessage[] = [
  {
    id: uuidv4(),
    name: 'Wayne Kelley',
    message: 'Inhac habitasse platea dictumst. Vivamus adipiscing fermentum quam volutpat aliquam.',
    date: '12-11-2020',
    type: 'News',
  },
  {
    id: uuidv4(),
    name: 'Joan Richardson',
    message: 'Elit eget elit facilisis tristique. Nam vel iaculis mauris. Sed ullamcorper tellus erat.',
    date: '12-11-2020',
    type: 'Notion',
  },
  {
    id: uuidv4(),
    name: 'Lauren Kennedy',
    message: 'Quisque justo turpis, vestibulum non enim nec, tempor mollis mi. Sed vel tristique.',
    date: '10-11-2020',
    type: 'News',
  },
  {
    id: uuidv4(),
    name: 'Kelly Moreno',
    message: 'Nam porttitor blandit accumsan. Ut vel dictum sem, a pretium dui. In malesuada enim.',
    date: '09-11-2020',
    type: 'News',
  },
  {
    id: uuidv4(),
    name: 'Lauren Peters',
    message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non dignissim maecenas.',
    date: '09-11-2020',
    type: 'Promotions',
  },
  {
    id: uuidv4(),
    name: 'Jordan Day',
    message: 'Quisque justo turpis, vestibulum non enim nec, tempor mollis mi. Sed vel tristique quam.',
    date: '09-11-2020',
    type: 'Notion',
  },
  {
    id: uuidv4(),
    name: 'Dorothy Baker',
    message: 'Fusce lorem leo, vehicula at nibh quis, facilisis accumsan porttitor velit turpis.',
    date: '09-11-2020',
    type: 'News',
  },
  {
    id: uuidv4(),
    name: 'Emma Wilson',
    message: 'Inhac habitasse platea dictumst. Vivamus adipiscing fermentum quam volutpat aliquam.',
    date: '01-11-2020',
    type: 'Promotions',
  },
]

function mapToCustomerSummary(customer: Customer): CustomerSummary {
  return {
    id: customer.id,
    name: `${customer.firstName} ${customer.lastName}`,
    email: customer.email,
    phone: customer.phone,
    status: customer.status,
  }
}

export function createMemoryStore(): AppRepository {
  let customers = [...seededCustomers]
  let inboxMessages = [...seededInboxMessages]

  return {
    listCustomers(filters?: CustomerFilters): CustomerSummary[] {
      const searchTerm = filters?.search?.trim().toLowerCase()

      return customers
        .filter((customer) => {
          if (filters?.status && customer.status !== filters.status) {
            return false
          }

          if (!searchTerm) {
            return true
          }

          return [customer.firstName, customer.lastName, customer.email, customer.phone, customer.id]
            .join(' ')
            .toLowerCase()
            .includes(searchTerm)
        })
        .map(mapToCustomerSummary)
    },

    getCustomerById(customerId: string): Customer | null {
      const customer = customers.find((item) => item.id === customerId)
      return customer ?? null
    },

    deleteCustomerById(customerId: string): boolean {
      const nextCustomers = customers.filter((customer) => customer.id !== customerId)

      if (nextCustomers.length === customers.length) {
        return false
      }

      customers = nextCustomers
      return true
    },

    getDashboard(): DashboardData {
      const totalCustomers = customers.length
      const newCustomers = customers.filter((customer) => customer.status === 'New').length
      const completedCustomers = customers.filter((customer) => customer.status === 'Completed').length

      return {
        stats: [
          {
            id: 'active-sessions',
            label: 'Active sessions',
            value: totalCustomers + 127,
            delta: '17%',
            trend: 'up',
          },
          {
            id: 'new-customers',
            label: 'New Customers',
            value: newCustomers,
            delta: '9%',
            trend: 'down',
          },
          {
            id: 'total-customers',
            label: 'Total Customers',
            value: totalCustomers,
            delta: '13%',
            trend: 'up',
          },
          {
            id: 'completed-sessions',
            label: 'Completed sessions',
            value: completedCustomers + 46,
            delta: '31%',
            trend: 'up',
          },
        ],
        chart: {
          months: MONTHS,
          points: CHART_POINTS,
        },
        miniWidgets: DASHBOARD_MINI_WIDGETS,
        incomeBreakdown: DASHBOARD_INCOME_BREAKDOWN,
      }
    },

    listInboxMessages(filters?: InboxFilters): InboxMessage[] {
      if (!filters?.type) {
        return inboxMessages
      }

      return inboxMessages.filter((item) => item.type === filters.type)
    },
  }
}

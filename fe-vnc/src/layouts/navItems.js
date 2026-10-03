import DashboardOutlined from '@mui/icons-material/DashboardOutlined'
import PeopleOutlined from '@mui/icons-material/PeopleOutlined'
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined'
import BusinessOutlined from '@mui/icons-material/BusinessOutlined'
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined'
import AssessmentOutlined from '@mui/icons-material/AssessmentOutlined'
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined'

// Everyday pages: shown as links in the top bar.
export const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: DashboardOutlined,
  },
  {
    to: '/commission-bills',
    label: 'Commission Bill',
    icon: ReceiptLongOutlined,
  },
  {
    to: '/reports',
    label: 'Reports',
    icon: AssessmentOutlined,
  },
  {
    to: '/sauda-book',
    label: 'Sauda Book',
    icon: MenuBookOutlined,
  },
]

// Master data pages: used rarely, so they live in the account menu.
// Also drives the dashboard quick links.
export const MASTER_DATA_ITEMS = [
  {
    to: '/users',
    label: 'Users',
    icon: PeopleOutlined,
    description: 'Manage people and their login access',
  },
  {
    to: '/items',
    label: 'Items',
    icon: Inventory2Outlined,
    description: 'Browse and edit the item list',
  },
  {
    to: '/companies',
    label: 'Companies',
    icon: BusinessOutlined,
    description: 'Manage company details and commission rates',
  },
]

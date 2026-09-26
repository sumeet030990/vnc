import DashboardOutlined from '@mui/icons-material/DashboardOutlined'
import PeopleOutlined from '@mui/icons-material/PeopleOutlined'
import AdminPanelSettingsOutlined from '@mui/icons-material/AdminPanelSettingsOutlined'
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined'

// One list drives the top bar links and the dashboard quick links.
export const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: DashboardOutlined,
  },
  {
    to: '/users',
    label: 'Users',
    icon: PeopleOutlined,
    description: 'Manage people and their login access',
  },
  {
    to: '/roles',
    label: 'Roles',
    icon: AdminPanelSettingsOutlined,
    description: 'See the roles users can be given',
  },
  {
    to: '/items',
    label: 'Items',
    icon: Inventory2Outlined,
    description: 'Browse and edit the item list',
  },
]

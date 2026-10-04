import { useMemo, useState } from 'react'
import { Box, Button, Fade, Snackbar, Stack, Typography } from '@mui/material'
import Add from '@mui/icons-material/Add'
import BusinessOutlined from '@mui/icons-material/BusinessOutlined'
import EditOutlined from '@mui/icons-material/EditOutlined'
import { MAIN_COMPANY_ID, useCompanies } from '../../api/companies.js'
import DataTable from '../../components/table/DataTable.jsx'
import RowActionButton from '../../components/table/RowActionButton.jsx'
import TableEmptyState from '../../components/table/TableEmptyState.jsx'
import TableSearchField from '../../components/table/TableSearchField.jsx'
import CompanyFormDialog from './CompanyFormDialog.jsx'

const SEARCH_FIELDS = [
  'name',
  'city',
  'primary_mobile_no',
  'gst_number',
  'pan_number',
]

const formatPercent = (value) => (value == null ? '—' : `${value}%`)

// GST and PAN on one line under the name, e.g. "GST 27AAA… · PAN ABCDE1234F".
const taxIds = (company) =>
  [
    company.gst_number && `GST ${company.gst_number}`,
    company.pan_number && `PAN ${company.pan_number}`,
  ]
    .filter(Boolean)
    .join(' · ')

function MutedCell({ value }) {
  return (
    <Typography variant="body2" color="text.secondary">
      {value || '—'}
    </Typography>
  )
}

function CompaniesPage() {
  const companies = useCompanies()

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 })
  const [searchInput, setSearchInput] = useState('')
  const search = searchInput.trim().toLowerCase()

  // `key` remounts the dialog on every open, so the form always starts fresh.
  const [formDialog, setFormDialog] = useState({
    open: false,
    company: null,
    key: 0,
  })
  const [notice, setNotice] = useState('')

  // The full list is already here, so search it in the browser.
  const data = useMemo(() => {
    const all = companies.data ?? []
    if (!search) return all
    return all.filter((company) =>
      SEARCH_FIELDS.some((field) =>
        company[field]?.toLowerCase().includes(search),
      ),
    )
  }, [companies.data, search])
  const total = data.length
  const isFiltered = Boolean(search)

  // A new search should start from the first page.
  const [lastSearch, setLastSearch] = useState(search)
  if (lastSearch !== search) {
    setLastSearch(search)
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }

  // Keep the page in range if the list gets shorter.
  const lastPage = Math.max(0, Math.ceil(total / pagination.pageSize) - 1)
  if (pagination.pageIndex > lastPage) {
    setPagination((p) => ({ ...p, pageIndex: lastPage }))
  }

  const openForm = (company = null) =>
    setFormDialog((d) => ({ open: true, company, key: d.key + 1 }))

  // Open the main company (id 1) for editing once, as soon as the list loads.
  const [autoOpened, setAutoOpened] = useState(false)
  if (!autoOpened && companies.data) {
    setAutoOpened(true)
    const mainCompany = companies.data.find(
      (company) => company.id === MAIN_COMPANY_ID,
    )
    if (mainCompany) openForm(mainCompany)
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Company',
        size: 260,
        Cell: ({ row }) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {row.original.name}
            </Typography>
            {taxIds(row.original) && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontFamily: 'monospace' }}
              >
                {taxIds(row.original)}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        accessorKey: 'primary_mobile_no',
        header: 'Mobile',
        size: 150,
        Cell: ({ cell }) => <MutedCell value={cell.getValue()} />,
      },
      {
        accessorKey: 'primary_email',
        header: 'Email',
        size: 220,
        Cell: ({ cell }) => <MutedCell value={cell.getValue()} />,
      },
      {
        accessorKey: 'city',
        header: 'City',
        size: 140,
        Cell: ({ cell }) => <MutedCell value={cell.getValue()} />,
      },
      {
        id: 'commission',
        header: 'Commission (seller / buyer)',
        size: 200,
        enableSorting: false,
        Cell: ({ row }) => (
          <MutedCell
            value={`${formatPercent(row.original.seller_commision_percentage)} / ${formatPercent(row.original.buyer_commision_percentage)}`}
          />
        ),
      },
      {
        accessorKey: 'tds_percentage',
        header: 'TDS',
        size: 100,
        Cell: ({ cell }) => (
          <MutedCell value={formatPercent(cell.getValue())} />
        ),
      },
    ],
    [],
  )

  return (
    <Fade in appear timeout={300}>
      <Stack spacing={4}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'flex-end' },
          }}
        >
          <Box>
            <Typography variant="overline" color="text.secondary">
              Master data
            </Typography>
            <Typography variant="h4" component="h1">
              Companies
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Keep your company details and commission rates up to date.
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={() => openForm()}
          >
            Add company
          </Button>
        </Stack>

        <DataTable
          columns={columns}
          data={data}
          query={companies}
          noun="company"
          nounPlural="companies"
          pagination={pagination}
          onPaginationChange={setPagination}
          filters={
            <TableSearchField
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search companies"
            />
          }
          renderRowActions={({ row }) => (
            <RowActionButton
              title="Edit"
              label={`Edit ${row.original.name}`}
              icon={<EditOutlined fontSize="small" />}
              onClick={() => openForm(row.original)}
            />
          )}
          emptyState={
            <TableEmptyState
              icon={<BusinessOutlined />}
              title={isFiltered ? 'No companies found' : 'No companies yet'}
              message={
                isFiltered
                  ? 'Try a different search.'
                  : 'Add your first company to get started.'
              }
              action={
                isFiltered ? (
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={() => setSearchInput('')}
                  >
                    Clear search
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => openForm()}
                  >
                    Add company
                  </Button>
                )
              }
            />
          }
        />

        <CompanyFormDialog
          key={`form-${formDialog.key}`}
          open={formDialog.open}
          company={formDialog.company}
          onClose={() => setFormDialog((d) => ({ ...d, open: false }))}
          onSaved={() => {
            setNotice(formDialog.company ? 'Company updated' : 'Company added')
            setFormDialog((d) => ({ ...d, open: false }))
          }}
        />

        <Snackbar
          open={Boolean(notice)}
          autoHideDuration={3000}
          onClose={() => setNotice('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          message={notice}
        />
      </Stack>
    </Fade>
  )
}

export default CompaniesPage

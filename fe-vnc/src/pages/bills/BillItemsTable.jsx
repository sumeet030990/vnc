import { useRef } from 'react'
import { getIn } from 'formik'
import {
  Box,
  Button,
  Collapse,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import Add from '@mui/icons-material/Add'
import Close from '@mui/icons-material/Close'
import { useItems } from '../../api/items.js'
import { useUserOptions } from '../../api/users.js'
import OptionPicker from './OptionPicker.jsx'
import {
  buyerCommissionFor,
  emptyBillItem,
  formatCount,
  formatMoney,
  recalcBillItem,
  sumBy,
} from './billForm.js'

// Typed columns, in Tab order after the seller and item pickers.
const NUMBER_COLUMNS = [
  { field: 'quantity_bags', label: 'Bags', whole: true },
  { field: 'packaging', label: 'Packing', whole: true },
  { field: 'weight', label: 'Weight (qtl)' },
  { field: 'souda_rate', label: 'Rate' },
  { field: 'amount', label: 'Amount' },
  { field: 'seller_commision_amount', label: 'Commission' },
]

// Row number | seller | item | seller bill no | 6 numbers | remove.
const GRID_COLUMNS = [
  '28px',
  'minmax(170px, 1.7fr)',
  'minmax(140px, 1.3fr)',
  'minmax(96px, 0.9fr)',
  'repeat(3, minmax(72px, 0.62fr))',
  'minmax(84px, 0.8fr)',
  'minmax(104px, 1fr)',
  'minmax(92px, 0.85fr)',
  '32px',
].join(' ')

const rowGridSx = {
  display: 'grid',
  gridTemplateColumns: GRID_COLUMNS,
  columnGap: 1,
  alignItems: 'center',
}

const numberInputSx = {
  '& input': { textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
}

function HeaderCell({ children, align = 'center' }) {
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        textAlign: align,
        px: 0.5,
      }}
    >
      {children}
    </Typography>
  )
}

function TotalCell({ children }) {
  return (
    <Typography
      variant="body2"
      sx={{
        fontWeight: 600,
        textAlign: 'right',
        px: 1.75,
        fontVariantNumeric: 'tabular-nums',
        color: 'primary.main',
      }}
    >
      {children}
    </Typography>
  )
}

// The editable list of items on a bill. Works on the parent's Formik state.
function BillItemsTable({ formik }) {
  const sellers = useUserOptions('seller')
  const items = useItems()
  const rows = formik.values.bill_items

  // After "Add item", the new row's seller box takes the cursor once it mounts.
  const focusRowKey = useRef(null)
  const focusIfNew = (rowKey) => (el) => {
    if (el && focusRowKey.current === rowKey) {
      focusRowKey.current = null
      el.focus()
    }
  }

  const addRow = () => {
    const row = emptyBillItem()
    focusRowKey.current = row.key
    formik.setFieldValue('bill_items', [...rows, row])
  }

  const removeRow = (index) => {
    const nextRows = rows.filter((_row, i) => i !== index)
    formik.setValues({
      ...formik.values,
      bill_items: nextRows,
      buyer_commision_amount: buyerCommissionFor(nextRows),
    })
  }

  // Typing a number fills in weight, amount and commissions (see billForm.js).
  const handleNumberChange = (index, field) => (event) => {
    const row = recalcBillItem(
      { ...rows[index], [field]: event.target.value },
      field,
    )
    const nextRows = rows.map((r, i) => (i === index ? row : r))
    formik.setValues({
      ...formik.values,
      bill_items: nextRows,
      // Only touch buyer commission when the weight moved, so a hand-typed
      // value survives edits to rate or amount.
      ...(row.weight !== rows[index].weight && {
        buyer_commision_amount: buyerCommissionFor(nextRows),
      }),
    })
  }

  const errorFor = (name) =>
    getIn(formik.touched, name) ? getIn(formik.errors, name) : undefined

  const textFieldProps = (index, field) => {
    const name = `bill_items.${index}.${field}`
    return {
      name,
      value: rows[index][field],
      onChange: formik.handleChange,
      onBlur: formik.handleBlur,
      error: Boolean(errorFor(name)),
      size: 'small',
      fullWidth: true,
      autoComplete: 'off',
    }
  }

  // One short message per row keeps the rows lined up.
  const rowMessage = (index) => {
    const fields = ['seller', 'item', 'seller_bill_no']
      .concat(NUMBER_COLUMNS.map((c) => c.field))
      .map((field) => errorFor(`bill_items.${index}.${field}`))
    return fields.find(Boolean)
  }

  const listError =
    typeof formik.errors.bill_items === 'string' && formik.submitCount > 0
      ? formik.errors.bill_items
      : null

  return (
    <Box>
      <Box sx={{ overflowX: 'auto', mx: -0.5, px: 0.5 }}>
        <Box sx={{ minWidth: 1040 }}>
          <Box sx={{ ...rowGridSx, pb: 1 }}>
            <HeaderCell>#</HeaderCell>
            <HeaderCell>Seller</HeaderCell>
            <HeaderCell>Item</HeaderCell>
            <HeaderCell>Seller bill no.</HeaderCell>
            {NUMBER_COLUMNS.map((column) => (
              <HeaderCell key={column.field}>{column.label}</HeaderCell>
            ))}
            <span />
          </Box>

          {rows.map((row, index) => {
            const base = `bill_items.${index}`
            const message = rowMessage(index)
            return (
              <Box
                key={row.key}
                sx={(t) => ({
                  py: 0.75,
                  borderRadius: '10px',
                  transition: 'background-color 150ms ease',
                  '&:focus-within': {
                    bgcolor: alpha(t.palette.secondary.main, 0.05),
                  },
                  '& .remove-row': { opacity: 0, transition: 'opacity 150ms' },
                  '&:hover .remove-row, &:focus-within .remove-row': {
                    opacity: 1,
                  },
                  animation: 'billRowIn 220ms ease',
                  '@keyframes billRowIn': {
                    from: { opacity: 0, transform: 'translateY(-4px)' },
                    to: { opacity: 1, transform: 'none' },
                  },
                })}
              >
                <Box sx={rowGridSx}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      textAlign: 'center',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {index + 1}
                  </Typography>
                  <OptionPicker
                    id={`bill-item-${row.key}-seller`}
                    label={`Seller, row ${index + 1}`}
                    dense
                    options={sellers.data}
                    loading={sellers.isPending}
                    value={row.seller}
                    onChange={(option) =>
                      formik.setFieldValue(`${base}.seller`, option)
                    }
                    onBlur={() => formik.setFieldTouched(`${base}.seller`)}
                    error={Boolean(errorFor(`${base}.seller`))}
                    inputRef={focusIfNew(row.key)}
                  />
                  <OptionPicker
                    id={`bill-item-${row.key}-item`}
                    label={`Item, row ${index + 1}`}
                    dense
                    options={items.data}
                    loading={items.isPending}
                    value={row.item}
                    onChange={(option) =>
                      formik.setFieldValue(`${base}.item`, option)
                    }
                    onBlur={() => formik.setFieldTouched(`${base}.item`)}
                    error={Boolean(errorFor(`${base}.item`))}
                  />
                  <TextField
                    {...textFieldProps(index, 'seller_bill_no')}
                    slotProps={{
                      htmlInput: {
                        'aria-label': `Seller bill number, row ${index + 1}`,
                      },
                    }}
                  />
                  {NUMBER_COLUMNS.map((column) => (
                    <TextField
                      key={column.field}
                      {...textFieldProps(index, column.field)}
                      onChange={handleNumberChange(index, column.field)}
                      sx={numberInputSx}
                      slotProps={{
                        htmlInput: {
                          inputMode: column.whole ? 'numeric' : 'decimal',
                          'aria-label': `${column.label}, row ${index + 1}`,
                        },
                      }}
                    />
                  ))}
                  <Tooltip title="Remove row">
                    <span className="remove-row">
                      <IconButton
                        size="small"
                        // Mouse only, so Tab goes straight to the next row.
                        tabIndex={-1}
                        aria-label={`Remove row ${index + 1}`}
                        disabled={rows.length === 1}
                        onClick={() => removeRow(index)}
                        sx={{
                          color: 'text.secondary',
                          '&:hover': {
                            color: 'error.main',
                            bgcolor: (t) => alpha(t.palette.error.main, 0.08),
                          },
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
                <Collapse in={Boolean(message)}>
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ display: 'block', pl: '36px', pt: 0.5 }}
                  >
                    {message}
                  </Typography>
                </Collapse>
              </Box>
            )
          })}

          {/* Running totals line up under their columns. */}
          <Box
            sx={{
              ...rowGridSx,
              mt: 1,
              pt: 1.5,
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            <Box sx={{ gridColumn: '2 / span 3' }}>
              <Button
                variant="text"
                color="primary"
                startIcon={<Add />}
                onClick={addRow}
                sx={{ ml: -1 }}
              >
                Add item
              </Button>
            </Box>
            <TotalCell>{formatCount(sumBy(rows, 'quantity_bags'))}</TotalCell>
            <span />
            <TotalCell>{formatCount(sumBy(rows, 'weight'))}</TotalCell>
            <span />
            <TotalCell>{formatMoney(sumBy(rows, 'amount'))}</TotalCell>
            <TotalCell>
              {formatMoney(sumBy(rows, 'seller_commision_amount'))}
            </TotalCell>
            <span />
          </Box>
        </Box>
      </Box>

      {listError && (
        <Typography
          variant="caption"
          color="error"
          sx={{ mt: 1, display: 'block' }}
        >
          {listError}
        </Typography>
      )}
      {(sellers.isError || items.isError) && (
        <Typography
          variant="caption"
          color="error"
          sx={{ mt: 1, display: 'block' }}
        >
          Could not load {sellers.isError ? 'sellers' : 'items'}. Check your
          connection and reload the page.
        </Typography>
      )}
    </Box>
  )
}

export default BillItemsTable

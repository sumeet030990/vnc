import { useEffect, useRef } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router'
import { useFormik } from 'formik'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Fade,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import ArrowBack from '@mui/icons-material/ArrowBack'
import { useBill, useCreateBill, useUpdateBill } from '../../api/bills.js'
import { useUserOptions } from '../../api/users.js'
import BillItemsTable from './BillItemsTable.jsx'
import OptionPicker from './OptionPicker.jsx'
import {
  billSchema,
  formatMoney,
  sumBy,
  toFormValues,
  toNumber,
  toRequestBody,
} from './billForm.js'

const LIST_PATH = '/commission-bills'
const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent)
const SAVE_SHORTCUT = isMac ? '⌘ S' : 'Ctrl + S'

const dateFormat = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' })

function Section({ title, subtitle, children, sx }) {
  return (
    <Paper
      elevation={0}
      sx={[
        (t) => ({
          p: 3,
          borderRadius: '12px',
          border: `1px solid ${alpha(t.palette.primary.main, 0.05)}`,
          boxShadow: t.customShadows.md,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {children}
    </Paper>
  )
}

function SummaryLine({ label, value, strong = false }) {
  return (
    <Stack
      direction="row"
      sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}
    >
      <Typography
        variant={strong ? 'subtitle1' : 'body2'}
        sx={{ fontWeight: strong ? 600 : 400, opacity: strong ? 1 : 0.75 }}
      >
        {label}
      </Typography>
      <Typography
        variant={strong ? 'h6' : 'body1'}
        component="span"
        sx={{
          fontVariantNumeric: 'tabular-nums',
          fontWeight: strong ? 700 : 500,
          color: strong ? 'secondary.light' : 'inherit',
        }}
      >
        {value}
      </Typography>
    </Stack>
  )
}

// Create and edit share this form. Mount a fresh copy per bill (use a `key`).
function BillForm({ bill }) {
  const isEdit = Boolean(bill)
  const navigate = useNavigate()
  const buyers = useUserOptions('buyer')
  const transporters = useUserOptions('transporter')
  const createBill = useCreateBill()
  const updateBill = useUpdateBill()
  const mutation = isEdit ? updateBill : createBill
  const formRef = useRef(null)

  const formik = useFormik({
    initialValues: toFormValues(bill),
    validationSchema: billSchema,
    onSubmit: async (values) => {
      const body = toRequestBody(values)
      try {
        if (isEdit) await updateBill.mutateAsync({ id: bill.id, ...body })
        else await createBill.mutateAsync(body)
        navigate(LIST_PATH, {
          state: { notice: isEdit ? 'Bill updated' : 'Bill saved' },
        })
      } catch {
        // The message shows from mutation.error, next to the save button.
      }
    },
  })

  // When a save is blocked by mistakes, jump to the first one.
  const handledSubmit = useRef(0)
  useEffect(() => {
    if (formik.isSubmitting || formik.submitCount === handledSubmit.current) {
      return
    }
    handledSubmit.current = formik.submitCount
    if (!formik.isValid) {
      formRef.current?.querySelector('[aria-invalid="true"]')?.focus()
    }
  }, [formik.isSubmitting, formik.submitCount, formik.isValid])

  const handleKeyDown = (event) => {
    // Ctrl/⌘ + S saves from anywhere on the form.
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault()
      if (!formik.isSubmitting) formik.submitForm()
      return
    }
    // Enter in a box shouldn't save a half-filled bill by accident.
    if (event.key === 'Enter' && event.target.tagName === 'INPUT') {
      event.preventDefault()
    }
  }

  const errorFor = (name) => formik.touched[name] && formik.errors[name]

  const fieldProps = (name) => ({
    id: `bill-${name}`,
    name,
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: Boolean(errorFor(name)),
    helperText: errorFor(name),
    fullWidth: true,
    autoComplete: 'off',
  })

  const moneyFieldProps = (name) => ({
    ...fieldProps(name),
    slotProps: {
      htmlInput: { inputMode: 'decimal' },
      input: {
        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
      },
    },
  })

  const pickerProps = (name) => ({
    id: `bill-${name}`,
    value: formik.values[name],
    onChange: (option) => formik.setFieldValue(name, option),
    onBlur: () => formik.setFieldTouched(name),
    error: Boolean(errorFor(name)),
    helperText: errorFor(name),
    required: true,
  })

  const rows = formik.values.bill_items
  const itemsTotal = sumBy(rows, 'amount')
  const additionalExpense =
    toNumber(formik.values.freight) +
    toNumber(formik.values.lorry_brokerage) -
    toNumber(formik.values.advance_freight)

  return (
    <Box
      component="form"
      ref={formRef}
      noValidate
      onSubmit={formik.handleSubmit}
      onKeyDown={handleKeyDown}
    >
      <Stack spacing={3}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
          <Tooltip title="Back to bills">
            <IconButton
              component={RouterLink}
              to={LIST_PATH}
              aria-label="Back to bills"
              // Mouse only, so the first Tab stop is the buyer.
              tabIndex={-1}
              sx={{ mt: 2.5, color: 'text.secondary' }}
            >
              <ArrowBack />
            </IconButton>
          </Tooltip>
          <Box>
            <Typography variant="overline" color="text.secondary">
              Commission bill
            </Typography>
            <Typography variant="h4" component="h1">
              {isEdit ? `Bill #${bill.id}` : 'New bill'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              {isEdit
                ? `Created ${dateFormat.format(new Date(bill.createdAt))}`
                : 'Press Tab to move from one box to the next.'}
            </Typography>
          </Box>
        </Stack>

        <Section title="Buyer and lorry">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <OptionPicker
                {...pickerProps('buyer')}
                label="Buyer"
                options={buyers.data}
                loading={buyers.isPending}
                autoFocus
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <OptionPicker
                {...pickerProps('transporter')}
                label="Transporter"
                options={transporters.data}
                loading={transporters.isPending}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                {...fieldProps('bill_date')}
                label="Bill date"
                type="date"
                required
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField {...fieldProps('lorry_number')} label="Lorry number" />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                {...fieldProps('lorry_driver_contact')}
                label="Driver contact"
                type="tel"
              />
            </Grid>
          </Grid>
          {(buyers.isError || transporters.isError) && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Could not load buyers or transporters. Check your connection and
              reload the page.
            </Alert>
          )}
        </Section>

        <Section
          title="Items"
          subtitle="One row per seller lot. Weight, amount and commission fill in as you type, and you can still change them."
        >
          <BillItemsTable formik={formik} />
        </Section>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Section title="Charges and commission" sx={{ height: '100%' }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField {...moneyFieldProps('freight')} label="Freight" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    {...moneyFieldProps('advance_freight')}
                    label="Advance freight"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    {...moneyFieldProps('lorry_brokerage')}
                    label="Lorry brokerage"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    {...moneyFieldProps('buyer_commision_amount')}
                    label="Buyer commission"
                  />
                </Grid>
              </Grid>
            </Section>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            {/* Navy summary card: the one place to read the bill's numbers. */}
            <Paper
              elevation={0}
              sx={(t) => ({
                p: 3,
                height: '100%',
                borderRadius: '12px',
                bgcolor: 'primary.main',
                color: alpha(t.palette.common.white, 0.92),
                boxShadow: t.customShadows.md,
              })}
            >
              <Typography
                variant="overline"
                sx={{ opacity: 0.6, display: 'block', mb: 2 }}
              >
                Summary
              </Typography>
              <Stack spacing={1.5}>
                <SummaryLine
                  label="Bill total"
                  value={formatMoney(itemsTotal)}
                />
                <SummaryLine
                  label="Additional expense"
                  value={formatMoney(additionalExpense)}
                />
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Save bar stays in view while scrolling long bills. */}
        <Paper
          elevation={0}
          sx={(t) => ({
            position: 'sticky',
            bottom: 16,
            zIndex: 2,
            px: 3,
            py: 1.75,
            borderRadius: '12px',
            border: `1px solid ${alpha(t.palette.primary.main, 0.06)}`,
            boxShadow: t.customShadows.lg,
            bgcolor: alpha(t.palette.common.white, 0.92),
            backdropFilter: 'blur(8px)',
          })}
        >
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              {mutation.isError ? (
                <Typography variant="body2" color="error" noWrap>
                  {mutation.error.message}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Press{' '}
                  <Box
                    component="kbd"
                    sx={(t) => ({
                      px: 0.75,
                      py: 0.25,
                      borderRadius: '6px',
                      fontFamily: 'inherit',
                      fontSize: 12,
                      fontWeight: 600,
                      bgcolor: alpha(t.palette.primary.main, 0.06),
                    })}
                  >
                    {SAVE_SHORTCUT}
                  </Box>{' '}
                  to save
                </Typography>
              )}
            </Box>
            <Button
              component={RouterLink}
              to={LIST_PATH}
              variant="outlined"
              color="inherit"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting
                ? 'Saving…'
                : isEdit
                  ? 'Save changes'
                  : 'Save bill'}
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  )
}

// /commission-bills/new makes a bill; /commission-bills/:id edits one.
function BillFormPage() {
  const { id } = useParams()
  const billId = id ? Number(id) : null
  const bill = useBill(billId)

  if (billId && bill.isPending) {
    return (
      <Stack sx={{ alignItems: 'center', py: 12 }}>
        <CircularProgress color="secondary" />
      </Stack>
    )
  }

  if (billId && bill.isError) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" component={RouterLink} to={LIST_PATH}>
            Back to bills
          </Button>
        }
      >
        Could not load this bill: {bill.error.message}
      </Alert>
    )
  }

  return (
    <Fade in appear timeout={300}>
      <Box>
        <BillForm key={billId ?? 'new'} bill={bill.data ?? null} />
      </Box>
    </Fade>
  )
}

export default BillFormPage

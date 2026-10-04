import { useFormik } from 'formik'
import * as yup from 'yup'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import AddBusinessOutlined from '@mui/icons-material/AddBusinessOutlined'
import Close from '@mui/icons-material/Close'
import EditOutlined from '@mui/icons-material/EditOutlined'
import { useCreateCompany, useUpdateCompany } from '../../api/companies.js'

// Same limits as the backend (src/app/validations/companyValidation.ts).
const MAX_TEXT = 191

const optionalText = (label) =>
  yup
    .string()
    .trim()
    .max(MAX_TEXT, `${label} must be at most ${MAX_TEXT} characters`)

const mobileNo = (label) =>
  yup
    .string()
    .trim()
    .matches(/^\+?[0-9]{7,15}$/, {
      message: `${label} must be 7 to 15 digits`,
      excludeEmptyString: true,
    })

const email = (label) =>
  optionalText(label).email(`${label} must be a valid email`)

// Empty is fine; otherwise a number from 0 to 100.
const percentage = (label) =>
  yup
    .number()
    .transform((value, original) => (original === '' ? undefined : value))
    .typeError(`${label} must be a number`)
    .min(0, `${label} cannot be negative`)
    .max(100, `${label} must be 100 or less`)

const schema = yup.object({
  name: optionalText('Name').required('Please enter a name'),
  primary_mobile_no: mobileNo('Primary mobile number'),
  secondary_mobile_no: mobileNo('Secondary mobile number'),
  primary_email: email('Primary email'),
  secondary_email: email('Secondary email'),
  address: optionalText('Address'),
  city: optionalText('City'),
  state: optionalText('State'),
  pin_code: yup
    .string()
    .trim()
    .matches(/^[0-9]{6}$/, {
      message: 'Pin code must be 6 digits',
      excludeEmptyString: true,
    }),
  gst_number: yup
    .string()
    .trim()
    .matches(/^[0-9A-Za-z]{15}$/, {
      message: 'GST number must be 15 letters and numbers',
      excludeEmptyString: true,
    }),
  pan_number: yup
    .string()
    .trim()
    .matches(/^[A-Za-z]{5}[0-9]{4}[A-Za-z]$/, {
      message: 'PAN number must be 5 letters, 4 digits, then 1 letter',
      excludeEmptyString: true,
    }),
  seller_commision_percentage: percentage('Seller commission'),
  buyer_commision_percentage: percentage('Buyer commission'),
  tds_percentage: percentage('TDS'),
})

const TEXT_FIELDS = [
  'name',
  'primary_mobile_no',
  'secondary_mobile_no',
  'primary_email',
  'secondary_email',
  'address',
  'city',
  'state',
  'pin_code',
  'gst_number',
  'pan_number',
]
const PERCENT_FIELDS = [
  'seller_commision_percentage',
  'buyer_commision_percentage',
  'tds_percentage',
]

const toFormValues = (company) =>
  Object.fromEntries(
    [...TEXT_FIELDS, ...PERCENT_FIELDS].map((field) => [
      field,
      company?.[field] ?? '',
    ]),
  )

// The API wants null (not '') for empty fields. PUT needs every field.
const toRequestBody = (values) => ({
  ...Object.fromEntries(
    TEXT_FIELDS.map((field) => [field, values[field].trim() || null]),
  ),
  gst_number: values.gst_number.trim().toUpperCase() || null,
  pan_number: values.pan_number.trim().toUpperCase() || null,
  ...Object.fromEntries(
    PERCENT_FIELDS.map((field) => [
      field,
      values[field] === '' ? null : Number(values[field]),
    ]),
  ),
})

// Turns the API's { errors: { field: [msg] } } into Formik errors.
const toFieldErrors = (errors = {}) =>
  Object.fromEntries(
    Object.entries(errors)
      .filter(([, messages]) => messages?.length)
      .map(([field, messages]) => [field, messages[0]]),
  )

function SectionLabel({ children }) {
  return (
    <Typography
      variant="overline"
      color="text.secondary"
      component="h3"
      sx={{ display: 'block', mb: 1.5, lineHeight: 1.5 }}
    >
      {children}
    </Typography>
  )
}

const percentSlotProps = {
  input: { endAdornment: <InputAdornment position="end">%</InputAdornment> },
  htmlInput: { min: 0, max: 100, step: 0.01, inputMode: 'decimal' },
}

// Mount a fresh copy per open (use a `key`) so the form resets each time.
function CompanyFormDialog({ open, company, onClose, onSaved }) {
  const isEdit = Boolean(company)
  const createCompany = useCreateCompany()
  const updateCompany = useUpdateCompany()
  const mutation = isEdit ? updateCompany : createCompany

  const formik = useFormik({
    initialValues: toFormValues(company),
    validationSchema: schema,
    onSubmit: async (values, { setErrors }) => {
      const body = toRequestBody(values)
      try {
        const saved = isEdit
          ? await updateCompany.mutateAsync({ id: company.id, ...body })
          : await createCompany.mutateAsync(body)
        onSaved(saved)
      } catch (error) {
        // The general message shows from mutation.error; fields get their own.
        setErrors(toFieldErrors(error.data?.errors))
      }
    },
  })

  const fieldProps = (name) => ({
    id: `company-${name}`,
    name,
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: Boolean(formik.touched[name] && formik.errors[name]),
    helperText: formik.touched[name] && formik.errors[name],
    fullWidth: true,
  })

  const handleClose = () => {
    if (!formik.isSubmitting) onClose()
  }

  const TitleIcon = isEdit ? EditOutlined : AddBusinessOutlined

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="company-form-title"
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: formik.handleSubmit,
          noValidate: true,
        },
      }}
    >
      <DialogTitle
        id="company-form-title"
        component="div"
        sx={{ px: 3, pt: 3, pb: 2.5 }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Avatar
            variant="rounded"
            sx={{
              width: 44,
              height: 44,
              bgcolor: (t) => alpha(t.palette.secondary.main, 0.14),
              color: 'secondary.dark',
            }}
          >
            <TitleIcon />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" component="h2">
              {isEdit ? 'Edit company' : 'Add a new company'}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {isEdit
                ? `Update details for ${company.name}.`
                : 'Only the name is needed now; fill the rest any time.'}
            </Typography>
          </Box>
          <IconButton
            aria-label="Close"
            onClick={handleClose}
            sx={{ alignSelf: 'flex-start', color: 'text.secondary' }}
          >
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ px: 3, py: 3, borderColor: 'divider' }}>
        {mutation.isError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {mutation.error.message}
          </Alert>
        )}

        <SectionLabel>Details</SectionLabel>
        <Grid container spacing={2}>
          <Grid size={12}>
            <TextField
              {...fieldProps('name')}
              label="Company name"
              required
              autoFocus
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField {...fieldProps('gst_number')} label="GST number" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField {...fieldProps('pan_number')} label="PAN number" />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3.5 }}>
          <SectionLabel>Contact</SectionLabel>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...fieldProps('primary_mobile_no')}
                label="Primary mobile"
                type="tel"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...fieldProps('secondary_mobile_no')}
                label="Secondary mobile"
                type="tel"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...fieldProps('primary_email')}
                label="Primary email"
                type="email"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...fieldProps('secondary_email')}
                label="Secondary email"
                type="email"
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 3.5 }}>
          <SectionLabel>Address</SectionLabel>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                {...fieldProps('address')}
                label="Address"
                multiline
                minRows={2}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField {...fieldProps('city')} label="City" />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField {...fieldProps('state')} label="State" />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                {...fieldProps('pin_code')}
                label="Pin code"
                slotProps={{ htmlInput: { inputMode: 'numeric' } }}
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 3.5 }}>
          <SectionLabel>Commission &amp; TDS</SectionLabel>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                {...fieldProps('seller_commision_percentage')}
                label="Seller commission"
                type="number"
                slotProps={percentSlotProps}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                {...fieldProps('buyer_commision_percentage')}
                label="Buyer commission"
                type="number"
                slotProps={percentSlotProps}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                {...fieldProps('tds_percentage')}
                label="TDS"
                type="number"
                slotProps={percentSlotProps}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          gap: 1,
          bgcolor: (t) => alpha(t.palette.background.default, 0.6),
        }}
      >
        <Button onClick={handleClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting
            ? 'Saving…'
            : isEdit
              ? 'Save changes'
              : 'Add company'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CompanyFormDialog

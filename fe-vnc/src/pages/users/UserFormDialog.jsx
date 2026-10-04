import { useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import Close from '@mui/icons-material/Close'
import EditOutlined from '@mui/icons-material/EditOutlined'
import PersonAddOutlined from '@mui/icons-material/PersonAddOutlined'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useRoles } from '../../api/roles.js'
import { useCreateUser, useUpdateUser } from '../../api/users.js'

// Same limits as the backend (src/app/validations/userValidation.ts).
const MAX_TEXT = 191

const optionalText = (label) =>
  yup
    .string()
    .trim()
    .max(MAX_TEXT, `${label} must be at most ${MAX_TEXT} characters`)

// States offered in the dropdown, with their GST state codes.
const STATES = [
  { name: 'Maharashtra', code: '27' },
  { name: 'Andhra Pradesh', code: '37' },
]

// Empty is fine; otherwise it must match `pattern`.
const optionalPattern = (pattern, message) =>
  yup.string().trim().matches(pattern, { message, excludeEmptyString: true })

// `isEdit` decides whether a password is needed: on edit, blank keeps the current one.
const buildSchema = (isEdit) =>
  yup.object({
    name: optionalText('Name').required('Please enter a name'),
    primary_mobile_no: yup
      .string()
      .trim()
      .required('Please enter a mobile number')
      .matches(/^\+?[0-9]{7,15}$/, 'Mobile number must be 7 to 15 digits'),
    secondary_mobile_no: optionalPattern(
      /^\+?[0-9]{7,15}$/,
      'Secondary mobile number must be 7 to 15 digits',
    ),
    roleId: yup.number().required('Please select a role'),
    gst_number: optionalPattern(
      /^[0-9A-Za-z]{15}$/,
      'GST number must be 15 letters and numbers',
    ),
    pan_number: optionalPattern(
      /^[A-Za-z]{5}[0-9]{4}[A-Za-z]$/,
      'PAN number must be 5 letters, 4 digits, then 1 letter',
    ),
    address: optionalText('Address'),
    city: optionalText('City'),
    state: optionalText('State'),
    // A GSTIN starts with the state code, so the two must agree.
    state_code: optionalPattern(
      /^[0-9]{2}$/,
      'State code must be 2 digits',
    ).test(
      'matches-gst',
      'State code does not match the GST number',
      (value, ctx) => {
        const gst = ctx.parent.gst_number?.trim()
        return !value || !gst || gst.startsWith(value)
      },
    ),
    pin_code: optionalPattern(/^[0-9]{6}$/, 'Pin code must be 6 digits'),
    allow_login: yup.boolean(),
    user_name: yup
      .string()
      .trim()
      .when('allow_login', {
        is: true,
        then: (schema) => schema.required('Please enter a username'),
      })
      .matches(/^[A-Za-z0-9._-]{3,50}$/, {
        message:
          'Username must be 3 to 50 letters, numbers, dots, dashes or underscores',
        excludeEmptyString: true,
      }),
    password: yup
      .string()
      .max(MAX_TEXT, `Password must be at most ${MAX_TEXT} characters`)
      .when('allow_login', {
        is: (allowLogin) => allowLogin && !isEdit,
        then: (schema) => schema.required('Please enter a password'),
      }),
  })

const toFormValues = (user) => ({
  name: user?.name ?? '',
  primary_mobile_no: user?.primary_mobile_no ?? '',
  secondary_mobile_no: user?.secondary_mobile_no ?? '',
  roleId: user?.role?.id ?? '',
  gst_number: user?.gst_number ?? '',
  pan_number: user?.pan_number ?? '',
  address: user?.address ?? '',
  city: user?.city ?? '',
  state: user?.state ?? '',
  state_code: user?.state_code ?? '',
  pin_code: user?.pin_code ?? '',
  allow_login: user?.allow_login ?? false,
  user_name: user?.user_name ?? '',
  password: '',
})

// The API wants null (not '') for empty optional text.
const orNull = (value) => value.trim() || null

const toRequestBody = (values) => ({
  name: orNull(values.name),
  primary_mobile_no: values.primary_mobile_no.trim(),
  secondary_mobile_no: orNull(values.secondary_mobile_no),
  roleId: Number(values.roleId),
  gst_number: orNull(values.gst_number.toUpperCase()),
  pan_number: orNull(values.pan_number.toUpperCase()),
  address: orNull(values.address),
  city: orNull(values.city),
  state: orNull(values.state),
  state_code: orNull(values.state_code),
  pin_code: orNull(values.pin_code),
  allow_login: values.allow_login,
  user_name: orNull(values.user_name),
  // Only send a password when one was typed and login is on.
  ...(values.allow_login && values.password && { password: values.password }),
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

// Mount a fresh copy per open (use a `key`) so the form resets each time.
function UserFormDialog({ open, user, onClose, onSaved }) {
  const isEdit = Boolean(user)
  const [showPassword, setShowPassword] = useState(false)
  const roles = useRoles()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const mutation = isEdit ? updateUser : createUser

  const formik = useFormik({
    initialValues: toFormValues(user),
    validationSchema: buildSchema(isEdit),
    onSubmit: async (values, { setErrors }) => {
      const body = toRequestBody(values)
      try {
        const saved = isEdit
          ? await updateUser.mutateAsync({ id: user.id, ...body })
          : await createUser.mutateAsync(body)
        onSaved(saved)
      } catch (error) {
        // The general message shows from mutation.error; fields get their own.
        setErrors(toFieldErrors(error.data?.errors))
      }
    },
  })

  const fieldProps = (name) => ({
    id: `user-${name}`,
    name,
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: Boolean(formik.touched[name] && formik.errors[name]),
    helperText: formik.touched[name] && formik.errors[name],
    fullWidth: true,
  })

  // The first 2 digits of a GSTIN are the state code, so fill it in when blank.
  const handleGstChange = (event) => {
    formik.handleChange(event)
    const prefix = event.target.value.trim().slice(0, 2)
    if (!formik.values.state_code && /^[0-9]{2}$/.test(prefix)) {
      formik.setFieldValue('state_code', prefix)
    }
  }

  // Picking a state fills in its code; the code can still be changed by hand.
  const handleStateChange = (event) => {
    formik.handleChange(event)
    const match = STATES.find((s) => s.name === event.target.value)
    if (match) formik.setFieldValue('state_code', match.code)
  }

  // Keep a saved state that isn't in the list, so editing doesn't hide it.
  const savedState = user?.state
  const stateOptions =
    savedState && !STATES.some((s) => s.name === savedState)
      ? [...STATES, { name: savedState }]
      : STATES

  const handleClose = () => {
    if (!formik.isSubmitting) onClose()
  }

  const loginOn = formik.values.allow_login
  const TitleIcon = isEdit ? EditOutlined : PersonAddOutlined

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="user-form-title"
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: formik.handleSubmit,
          noValidate: true,
        },
      }}
    >
      <DialogTitle
        id="user-form-title"
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
              {isEdit ? 'Edit user' : 'Add a new user'}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {isEdit
                ? `Update details for ${user.name || user.user_name}.`
                : 'Add their details and choose if they can log in.'}
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
        {roles.isError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Could not load roles: {roles.error.message}
          </Alert>
        )}

        <SectionLabel>Details</SectionLabel>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField {...fieldProps('name')} label="Full name" required />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              {...fieldProps('primary_mobile_no')}
              label="Mobile number"
              required
              type="tel"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              {...fieldProps('roleId')}
              label="Role"
              required
              select
              disabled={roles.isPending || roles.isError}
            >
              {roles.data?.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              {...fieldProps('secondary_mobile_no')}
              label="Secondary mobile"
              type="tel"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3.5 }}>
          <SectionLabel>Tax details</SectionLabel>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...fieldProps('gst_number')}
                onChange={handleGstChange}
                label="GST number"
                slotProps={{
                  htmlInput: { style: { textTransform: 'uppercase' } },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...fieldProps('pan_number')}
                label="PAN number"
                slotProps={{
                  htmlInput: { style: { textTransform: 'uppercase' } },
                }}
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField {...fieldProps('city')} label="City" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...fieldProps('pin_code')}
                label="Pin code"
                slotProps={{ htmlInput: { inputMode: 'numeric' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                {...fieldProps('state')}
                onChange={handleStateChange}
                label="State"
                select
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {stateOptions.map((s) => (
                  <MenuItem key={s.name} value={s.name}>
                    {s.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                {...fieldProps('state_code')}
                label="State code"
                helperText={
                  (formik.touched.state_code && formik.errors.state_code) ||
                  'e.g. 27'
                }
                slotProps={{
                  htmlInput: { inputMode: 'numeric', maxLength: 2 },
                }}
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 3.5 }}>
          <SectionLabel>Login access</SectionLabel>
          {/* Panel tints gold when login is on, so the state is easy to see. */}
          <Box
            sx={(t) => ({
              border: 1,
              borderRadius: '12px',
              borderColor: loginOn
                ? alpha(t.palette.secondary.main, 0.45)
                : 'divider',
              bgcolor: loginOn
                ? alpha(t.palette.secondary.main, 0.05)
                : alpha(t.palette.background.default, 0.6),
              transition:
                'background-color 200ms ease, border-color 200ms ease',
            })}
          >
            <Stack
              component="label"
              direction="row"
              spacing={2}
              sx={{ alignItems: 'center', p: 2, cursor: 'pointer' }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Allow this user to log in
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  They'll sign in with a username and password.
                </Typography>
              </Box>
              <Switch
                name="allow_login"
                checked={loginOn}
                onChange={formik.handleChange}
              />
            </Stack>

            <Collapse in={loginOn} unmountOnExit>
              <Grid container spacing={2} sx={{ px: 2, pb: 2 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    {...fieldProps('user_name')}
                    label="Username"
                    required
                    autoComplete="off"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    {...fieldProps('password')}
                    label={isEdit ? 'New password' : 'Password'}
                    required={!isEdit}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    helperText={
                      (formik.touched.password && formik.errors.password) ||
                      (isEdit && 'Leave blank to keep the current one')
                    }
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={
                                showPassword ? 'Hide password' : 'Show password'
                              }
                              onClick={() => setShowPassword((show) => !show)}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? (
                                <VisibilityOff fontSize="small" />
                              ) : (
                                <Visibility fontSize="small" />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Collapse>
          </Box>
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
              : 'Add user'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UserFormDialog

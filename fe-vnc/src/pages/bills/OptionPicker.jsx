import { Autocomplete, TextField, Typography } from '@mui/material'

const optionLabel = (option) => option?.name || `#${option?.id}`

// Searchable dropdown built for the keyboard: type a few letters and the
// first match is highlighted, then Tab picks it and moves to the next field.
// `options` and `value` are { id, name } objects.
// `getOptionNote` (optional) adds small grey text on the right of each option.
// `dense` is for table cells: small and no visible label. `size` overrides it.
function OptionPicker({
  id,
  label,
  options,
  loading = false,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  autoFocus = false,
  dense = false,
  size = dense ? 'small' : 'medium',
  inputRef,
  getOptionNote,
}) {
  return (
    <Autocomplete
      id={id}
      options={options ?? []}
      value={value}
      loading={loading}
      onChange={(_event, option) => onChange(option)}
      onBlur={onBlur}
      getOptionLabel={optionLabel}
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      autoHighlight
      autoSelect
      selectOnFocus
      handleHomeEndKeys
      size={size}
      fullWidth
      renderOption={(props, option) => {
        // Names can repeat, so key on the id instead of MUI's label key.
        const liProps = { ...props }
        delete liProps.key
        return (
          <li key={option.id} {...liProps}>
            {optionLabel(option)}
            {getOptionNote && (
              <Typography
                component="span"
                variant="caption"
                color="text.secondary"
                sx={{ ml: 'auto', pl: 2 }}
              >
                {getOptionNote(option)}
              </Typography>
            )}
          </li>
        )
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          // In a table row the column header is the label.
          label={dense ? undefined : label}
          required={required}
          autoFocus={autoFocus}
          inputRef={inputRef}
          error={error}
          helperText={helperText}
          slotProps={{
            ...params.slotProps,
            htmlInput: {
              ...params.slotProps.htmlInput,
              ...(dense && { 'aria-label': label }),
            },
          }}
        />
      )}
    />
  )
}

export default OptionPicker

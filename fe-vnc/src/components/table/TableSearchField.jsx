import { IconButton, InputAdornment, TextField } from '@mui/material'
import Close from '@mui/icons-material/Close'
import Search from '@mui/icons-material/Search'

// Search box for the table toolbar, with a clear (x) button.
function TableSearchField({ value, onChange, placeholder }) {
  return (
    <TextField
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      sx={{ flex: 1, maxWidth: { sm: 420 } }}
      slotProps={{
        htmlInput: { 'aria-label': placeholder },
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Search fontSize="small" sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
          endAdornment: value && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                aria-label="Clear search"
                onClick={() => onChange('')}
                edge="end"
              >
                <Close fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  )
}

export default TableSearchField

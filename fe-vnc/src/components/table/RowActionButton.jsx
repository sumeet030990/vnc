import { IconButton, Tooltip } from '@mui/material'
import { alpha } from '@mui/material/styles'

// Small icon button for a table row. `color` is the palette key used on hover.
function RowActionButton({
  title,
  label,
  icon,
  onClick,
  disabled = false,
  color = 'primary',
}) {
  return (
    <Tooltip title={title}>
      {/* Span keeps the tooltip working on a disabled button. */}
      <span>
        <IconButton
          size="small"
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: `${color}.main`,
              bgcolor: (t) =>
                alpha(t.palette[color].main, color === 'error' ? 0.08 : 0.06),
            },
          }}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  )
}

export default RowActionButton

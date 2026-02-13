import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import type { Checkpoint } from '~/api/generated';

interface CheckpointItemProps {
  checkpoint: Checkpoint;
  onClick?: () => void;
}

export function CheckpointItem({ checkpoint, onClick }: CheckpointItemProps) {
  return (
    <ListItem
      disableGutters
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { bgcolor: 'action.hover' } : undefined,
        borderRadius: 1,
        px: 1,
      }}
      onClick={onClick}
    >
      <ListItemIcon sx={{ minWidth: 36 }}>
        <CheckCircleOutlineIcon fontSize="small" color="action" />
      </ListItemIcon>
      <ListItemText
        primary={checkpoint.label}
        primaryTypographyProps={{
          variant: 'body2',
        }}
        secondary={
          checkpoint.isRequired && (
            <Chip
              label="Required"
              size="small"
              color="error"
              variant="outlined"
              sx={{ mt: 0.5, height: 20, fontSize: '0.65rem' }}
            />
          )
        }
      />
    </ListItem>
  );
}

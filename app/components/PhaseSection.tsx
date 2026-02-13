import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import type { Phase } from '~/api/generated';
import { CheckpointItem } from './CheckpointItem';

interface PhaseSectionProps {
  phase: Phase;
  onBadgeClick?: (badgeId: string) => void;
  onCheckpointClick?: (checkpointId: string) => void;
}

export function PhaseSection({ phase, onBadgeClick, onCheckpointClick }: PhaseSectionProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Chip label={`Phase ${phase.order + 1}`} size="small" color="primary" variant="outlined" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {phase.name}
          </Typography>
        </Box>
        {phase.description && (
          <Typography variant="body2" color="text.secondary">
            {phase.description}
          </Typography>
        )}
      </Box>

      {/* Badges */}
      {phase.badgeIds && phase.badgeIds.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Badges ({phase.badgeIds.length})
          </Typography>
          <List dense disablePadding>
            {phase.badgeIds.map((badgeId, index) => (
              <ListItem
                key={badgeId}
                disableGutters
                sx={{
                  cursor: onBadgeClick ? 'pointer' : 'default',
                  '&:hover': onBadgeClick ? { bgcolor: 'action.hover' } : undefined,
                  borderRadius: 1,
                  px: 1,
                }}
                onClick={() => onBadgeClick?.(badgeId)}
              >
                <ListItemText
                  primary={badgeId}
                  primaryTypographyProps={{
                    variant: 'body2',
                    sx: { fontFamily: 'monospace' },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Checkpoints */}
      {phase.checkpoints && phase.checkpoints.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Checkpoints ({phase.checkpoints.length})
          </Typography>
          <List dense disablePadding>
            {phase.checkpoints.map((checkpoint, index) => (
              <React.Fragment key={checkpoint.id}>
                {index > 0 && <Divider component="li" />}
                <CheckpointItem
                  checkpoint={checkpoint}
                  onClick={() => onCheckpointClick?.(checkpoint.id)}
                />
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}
    </Paper>
  );
}

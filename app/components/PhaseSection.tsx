import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import type { Phase } from '~/api/generated';
import { CheckpointItem } from './CheckpointItem';

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

interface PhaseSectionProps {
  phase: Phase;
  onBadgeClick?: (badgeId: string, collectionId: string) => void;
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
      {phase.badges && phase.badges.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Badges ({phase.badges.length})
          </Typography>
          <Stack gap={1}>
            {phase.badges.map((badge) => (
              <Paper
                key={badge.id}
                variant="outlined"
                onClick={() => onBadgeClick?.(badge.id, badge.collectionId)}
                sx={{
                  p: 1.5,
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'center',
                  cursor: onBadgeClick ? 'pointer' : 'default',
                  '&:hover': onBadgeClick ? { borderColor: 'primary.main' } : undefined,
                }}
              >
                <Avatar variant="rounded" src={badge.imageUrl} sx={{ width: 36, height: 36, borderRadius: 1 }}>
                  {getInitials(badge.name)}
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {badge.name}
                </Typography>
              </Paper>
            ))}
          </Stack>
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

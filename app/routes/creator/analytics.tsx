import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

export default function CreatorAnalytics() {
  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 3 }}>
        Creator Analytics
      </Typography>

      {/* Placeholder stat cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {['Total Issuances', 'Active Issuers', 'Collections Published'].map((label) => (
          <Grid size={{ xs: 12, sm: 4 }} key={label}>
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                bgcolor: 'grey.100',
                minHeight: 100,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.disabled', mb: 0.5 }}>
                —
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper
        variant="outlined"
        sx={{
          p: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 280,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Analytics dashboard coming soon
        </Typography>
      </Paper>
    </Box>
  );
}

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export default function CreatorSettings() {
  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 3 }}>
        Creator Settings
      </Typography>

      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="body1" color="text.secondary">
          Creator profile, verification status, brand assets, and default policies will go here.
        </Typography>
      </Paper>
    </Box>
  );
}

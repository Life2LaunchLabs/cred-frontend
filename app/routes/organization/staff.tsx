import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function OrganizationStaff() {
  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Staff
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Staff management coming soon.
      </Typography>
    </Box>
  );
}

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import StaffGrid from '~/components/placeholder/StaffGrid';

export default function OrganizationStaff() {
  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Staff
      </Typography>
      <StaffGrid />
    </Box>
  );
}

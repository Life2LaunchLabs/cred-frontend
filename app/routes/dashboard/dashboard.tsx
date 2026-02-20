import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function Home() {
  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Dashboard overview coming soon.
      </Typography>
    </Box>
  );
}

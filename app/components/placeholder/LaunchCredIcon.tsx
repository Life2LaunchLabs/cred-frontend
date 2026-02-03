import SvgIcon from '@mui/material/SvgIcon';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import VerifiedIcon from '@mui/icons-material/Verified';

export default function LaunchCredIcon() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
      <SvgIcon sx={{ height: 24, width: 24, mr: 0.5, color: 'primary.main' }}>
        <VerifiedIcon />
      </SvgIcon>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          background: 'linear-gradient(90deg, #4876EE 0%, #00D3AB 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px',
        }}
      >
        LaunchCRED
      </Typography>
    </Box>
  );
}

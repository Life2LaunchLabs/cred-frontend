import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';

const items = [
  {
    icon: <SettingsSuggestRoundedIcon />,
    title: 'Open Badge Standard',
    description:
      'Built on the Open Badges specification, ensuring your credentials are portable and universally recognized.',
  },
  {
    icon: <ConstructionRoundedIcon />,
    title: 'Enterprise Ready',
    description:
      'Scalable infrastructure designed for organizations of all sizes, from small teams to large institutions.',
  },
  {
    icon: <ThumbUpAltRoundedIcon />,
    title: 'Intuitive Badge Builder',
    description:
      'Create professional badges in minutes with our drag-and-drop designer. No design experience required.',
  },
  {
    icon: <AutoFixHighRoundedIcon />,
    title: 'Automated Issuance',
    description:
      'Set up rules to automatically issue badges based on completions, assessments, or integrations with your LMS.',
  },
  {
    icon: <SupportAgentRoundedIcon />,
    title: 'Dedicated Support',
    description:
      'Our credentialing experts are here to help you design and launch successful badge programs.',
  },
  {
    icon: <QueryStatsRoundedIcon />,
    title: 'Instant Verification',
    description:
      'Anyone can verify credential authenticity with a single click. Built-in fraud prevention protects your brand.',
  },
];

export default function Highlights() {
  return (
    <Box
      id="highlights"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        color: 'white',
        bgcolor: 'grey.900',
      }}
    >
      <Container
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 3, sm: 6 },
        }}
      >
        <Box
          sx={{
            width: { sm: '100%', md: '60%' },
            textAlign: { sm: 'left', md: 'center' },
          }}
        >
          <Typography component="h2" variant="h4" gutterBottom>
            Why LaunchCRED?
          </Typography>
          <Typography variant="body1" sx={{ color: 'grey.400' }}>
            Discover why organizations choose LaunchCRED for their digital credentialing needs.
            Industry standards, powerful features, and dedicated support for your success.
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {items.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Stack
                direction="column"
                component={Card}
                spacing={1}
                useFlexGap
                sx={{
                  color: 'inherit',
                  p: 3,
                  height: '100%',
                  borderColor: 'hsla(220, 25%, 25%, 0.3)',
                  backgroundColor: 'grey.800',
                }}
              >
                <Box sx={{ opacity: '50%' }}>{item.icon}</Box>
                <div>
                  <Typography gutterBottom sx={{ fontWeight: 'medium' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.400' }}>
                    {item.description}
                  </Typography>
                </div>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

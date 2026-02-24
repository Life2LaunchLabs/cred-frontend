import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useNavigate, useParams } from 'react-router';
import { useOrgPath } from '~/hooks/useOrgPath';

export default function CollectionSubmission() {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const orgPath = useOrgPath();

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 3 }}>
        <Button
          size="small"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() =>
            navigate(orgPath(collectionId ? `/creator/collections/${collectionId}` : '/creator/collections'))
          }
          sx={{ textTransform: 'none' }}
        >
          Back to Collection
        </Button>
      </Stack>

      <Typography component="h2" variant="h6" sx={{ mb: 3 }}>
        Submit for Review
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          p: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 240,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Your submission has been accepted! We'll let you know once the board completes their review.
        </Typography>
      </Paper>
    </Box>
  );
}

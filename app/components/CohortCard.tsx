import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import type { Cohort } from '~/api/generated';

interface CohortCardProps {
  cohort: Cohort;
  onClick?: (cohort: Cohort) => void;
}

export function CohortCard({ cohort, onClick }: CohortCardProps) {
  return (
    <Card
      sx={{
        width: 220,
        minWidth: 220,
        borderRadius: 2,
        overflow: 'hidden',
        flexShrink: 0,
        p: 0,
      }}
    >
      <CardActionArea onClick={() => onClick?.(cohort)}>
        {cohort.coverImageUrl ? (
          <CardMedia
            component="img"
            height="120"
            image={cohort.coverImageUrl}
            alt={cohort.name}
            sx={{ objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              height: 120,
              bgcolor: 'grey.200',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              No image
            </Typography>
          </Box>
        )}
        <Box
          sx={{
            px: 1.5,
            py: 1,
            bgcolor: 'background.paper',
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {cohort.name}
          </Typography>
          {cohort.learnerCount != null && (
            <Typography variant="caption" color="text.secondary">
              {cohort.learnerCount} {cohort.learnerCount === 1 ? 'learner' : 'learners'}
            </Typography>
          )}
        </Box>
      </CardActionArea>
    </Card>
  );
}

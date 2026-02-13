import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import type { Program } from '~/api/generated';

interface ProgramCardProps {
  program: Program;
  onClick?: (program: Program) => void;
}

export function ProgramCard({ program, onClick }: ProgramCardProps) {
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
      <CardActionArea onClick={() => onClick?.(program)}>
        {program.imageUrl ? (
          <CardMedia
            component="img"
            height="120"
            image={program.imageUrl}
            alt={program.name}
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
            {program.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {program.phaseCount ?? 0} {program.phaseCount === 1 ? 'phase' : 'phases'} • {program.totalBadgeCount ?? 0} {program.totalBadgeCount === 1 ? 'badge' : 'badges'}
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
}

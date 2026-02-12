import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { Cohort } from '~/api/generated';
import { CohortCard } from './CohortCard';

interface CohortCarouselProps {
  title: string;
  cohorts: Cohort[];
  isLoading?: boolean;
  onCardClick?: (cohort: Cohort) => void;
  onSeeAll?: () => void;
}

export default function CohortCarousel({
  title,
  cohorts,
  isLoading = false,
  onCardClick,
  onSeeAll,
}: CohortCarouselProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 240;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        position: 'relative',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {onSeeAll && (
          <Button
            variant="text"
            size="small"
            onClick={onSeeAll}
            sx={{ minWidth: 'auto' }}
          >
            See all
          </Button>
        )}
      </Box>

      <Box sx={{ position: 'relative' }}>
        {/* Left scroll button */}
        <IconButton
          onClick={() => handleScroll('left')}
          sx={{
            position: 'absolute',
            left: -16,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1,
            bgcolor: 'background.paper',
            boxShadow: 1,
            '&:hover': { bgcolor: 'action.hover' },
          }}
          size="small"
        >
          <ChevronLeftIcon />
        </IconButton>

        {/* Scrollable container */}
        <Box
          ref={scrollContainerRef}
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            py: 1,
            px: 1,
          }}
        >
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 220,
                  minWidth: 220,
                  height: 168,
                  borderRadius: 2,
                  bgcolor: 'grey.200',
                  flexShrink: 0,
                }}
              />
            ))
          ) : cohorts.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              No cohorts yet
            </Typography>
          ) : (
            cohorts.map((cohort) => (
              <CohortCard
                key={cohort.id}
                cohort={cohort}
                onClick={onCardClick}
              />
            ))
          )}
        </Box>

        {/* Right scroll button */}
        <IconButton
          onClick={() => handleScroll('right')}
          sx={{
            position: 'absolute',
            right: -16,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1,
            bgcolor: 'background.paper',
            boxShadow: 1,
            '&:hover': { bgcolor: 'action.hover' },
          }}
          size="small"
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}

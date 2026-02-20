import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { Collection } from '~/api/generated';

// ============================================================================
// COLLECTION CARD COMPONENT
// ============================================================================

interface CollectionCardProps {
  collection: Collection;
  onClick?: (collection: Collection) => void;
}

export function CollectionCard({ collection, onClick }: CollectionCardProps) {
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
      <CardActionArea onClick={() => onClick?.(collection)}>
        {collection.imageUrl ? (
          <CardMedia
            component="img"
            height="120"
            image={collection.imageUrl}
            alt={collection.name}
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
            {collection.name}
          </Typography>
          {collection.badgeCount != null && (
            <Typography variant="caption" color="text.secondary">
              {collection.badgeCount} {collection.badgeCount === 1 ? 'badge' : 'badges'}
            </Typography>
          )}
        </Box>
      </CardActionArea>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface BadgeCollectionCarouselProps {
  title: string;
  collections: Collection[];
  isLoading?: boolean;
  onCardClick?: (collection: Collection) => void;
  onSeeAll?: () => void;
}

export default function BadgeCollectionCarousel({
  title,
  collections,
  isLoading = false,
  onCardClick,
  onSeeAll,
}: BadgeCollectionCarouselProps) {
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
          <Button variant="text" size="small" onClick={onSeeAll} sx={{ minWidth: 'auto' }}>
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
          ) : collections.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              No collections yet
            </Typography>
          ) : (
            collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
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

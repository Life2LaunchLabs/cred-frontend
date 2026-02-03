import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardMedia from '@mui/material/CardMedia';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// ============================================================================
// TYPES & MOCK DATA
// ============================================================================

export interface BadgeCollection {
  id: number;
  title: string;
  badgeCount: number;
  imageUrl: string;
}

export const MOCK_COLLECTIONS: BadgeCollection[] = [
  {
    id: 1,
    title: 'Safety Certifications',
    badgeCount: 12,
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=300&h=200&fit=crop',
  },
  {
    id: 2,
    title: 'Technical Skills',
    badgeCount: 8,
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=200&fit=crop',
  },
  {
    id: 3,
    title: 'Leadership Training',
    badgeCount: 5,
    imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=300&h=200&fit=crop',
  },
  {
    id: 4,
    title: 'Compliance',
    badgeCount: 15,
    imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=300&h=200&fit=crop',
  },
  {
    id: 5,
    title: 'Professional Development',
    badgeCount: 20,
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=200&fit=crop',
  },
  {
    id: 6,
    title: 'Equipment Operations',
    badgeCount: 7,
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=200&fit=crop',
  },
];

export const MOCK_CREATED: BadgeCollection[] = [
  {
    id: 101,
    title: 'Onboarding Basics',
    badgeCount: 4,
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop',
  },
  {
    id: 102,
    title: 'Customer Service',
    badgeCount: 6,
    imageUrl: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=300&h=200&fit=crop',
  },
  {
    id: 103,
    title: 'Quality Assurance',
    badgeCount: 3,
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=200&fit=crop',
  },
];

// ============================================================================
// MOCK API HOOK
// ============================================================================

export function useCollections(mockData: BadgeCollection[]) {
  const [collections, setCollections] = React.useState<BadgeCollection[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setCollections(mockData);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [mockData]);

  return { collections, isLoading };
}

// ============================================================================
// COLLECTION CARD COMPONENT
// ============================================================================

interface CollectionCardProps {
  collection: BadgeCollection;
  onClick?: (collection: BadgeCollection) => void;
}

function CollectionCard({ collection, onClick }: CollectionCardProps) {
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
        <CardMedia
          component="img"
          height="120"
          image={collection.imageUrl}
          alt={collection.title}
          sx={{ objectFit: 'cover' }}
        />
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
            {collection.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {collection.badgeCount} {collection.badgeCount === 1 ? 'badge' : 'badges'}
          </Typography>
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
  collections: BadgeCollection[];
  isLoading?: boolean;
  onCardClick?: (collection: BadgeCollection) => void;
}

export default function BadgeCollectionCarousel({
  title,
  collections,
  isLoading = false,
  onCardClick,
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

  const handleCardClick = (collection: BadgeCollection) => {
    onCardClick?.(collection);
    console.log('Collection clicked:', collection);
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        position: 'relative',
      }}
    >
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
        {title}
      </Typography>

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
          ) : (
            collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onClick={handleCardClick}
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

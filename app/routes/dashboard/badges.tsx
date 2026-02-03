import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BadgeCollectionCarousel, {
  useCollections,
  MOCK_COLLECTIONS,
  MOCK_CREATED,
} from '~/components/BadgeCollectionCarousel';

export default function Badges() {
  const { collections, isLoading: collectionsLoading } = useCollections(MOCK_COLLECTIONS);
  const { collections: created, isLoading: createdLoading } = useCollections(MOCK_CREATED);

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Badges
      </Typography>

      <Stack spacing={3}>
        <BadgeCollectionCarousel
          title="Collections"
          collections={collections}
          isLoading={collectionsLoading}
        />
        <BadgeCollectionCarousel
          title="Created"
          collections={created}
          isLoading={createdLoading}
        />
      </Stack>
    </Box>
  );
}

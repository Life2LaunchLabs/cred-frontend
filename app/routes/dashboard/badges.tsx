import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router';
import BadgeCollectionCarousel from '~/components/BadgeCollectionCarousel';
import { useOrg } from '~/context/OrgContext';
import { listCollections } from '~/api/generated';
import type { Collection } from '~/api/generated';

export default function Badges() {
  const { activeOrg } = useOrg();
  const navigate = useNavigate();
  const [libraryCollections, setLibraryCollections] = React.useState<Collection[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!activeOrg) return;
    let cancelled = false;

    async function fetchCollections() {
      setIsLoading(true);
      const res = await listCollections({ orgId: activeOrg!.org.id });
      if (!cancelled && res.status === 200) {
        setLibraryCollections(res.data.data);
      }
      if (!cancelled) setIsLoading(false);
    }

    fetchCollections();
    return () => { cancelled = true; };
  }, [activeOrg]);

  const createdCollections = activeOrg
    ? libraryCollections.filter((c) => c.createdByOrgId === activeOrg.org.id)
    : [];

  const handleCollectionClick = (collection: Collection) => {
    navigate(`/home/badges/${collection.id}`);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Badges
      </Typography>

      <Stack spacing={3}>
        <BadgeCollectionCarousel
          title="Collections"
          collections={libraryCollections}
          isLoading={isLoading}
          onCardClick={handleCollectionClick}
        />
        <BadgeCollectionCarousel
          title="Created"
          collections={createdCollections}
          isLoading={isLoading}
          onCardClick={handleCollectionClick}
        />
      </Stack>
    </Box>
  );
}

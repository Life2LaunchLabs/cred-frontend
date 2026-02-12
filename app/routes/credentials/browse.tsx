import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router';
import { useOrg } from '~/context/OrgContext';
import { useOrgPath } from '~/hooks/useOrgPath';
import { browseRegistry, listCollections } from '~/api/generated';
import type { Collection } from '~/api/generated';
import { CollectionCard } from '~/components/BadgeCollectionCarousel';

export default function BadgesBrowse() {
  const { activeOrg } = useOrg();
  const navigate = useNavigate();
  const orgPath = useOrgPath();
  const [browseCollections, setBrowseCollections] = React.useState<Collection[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!activeOrg) return;
    let cancelled = false;

    async function fetchBrowse() {
      setIsLoading(true);

      const [registryRes, libraryRes] = await Promise.all([
        browseRegistry(),
        listCollections({ orgId: activeOrg!.org.id }),
      ]);

      if (!cancelled) {
        const registryData =
          registryRes.status === 200 ? registryRes.data.data : [];
        const libraryIds = new Set(
          libraryRes.status === 200
            ? libraryRes.data.data.map((c) => c.id)
            : [],
        );

        setBrowseCollections(
          registryData.filter((c) => !libraryIds.has(c.id)),
        );
        setIsLoading(false);
      }
    }

    fetchBrowse();
    return () => { cancelled = true; };
  }, [activeOrg]);

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Browse Collections
      </Typography>

      {isLoading ? (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Box
              key={i}
              sx={{
                width: 220,
                height: 168,
                borderRadius: 2,
                bgcolor: 'grey.200',
              }}
            />
          ))}
        </Box>
      ) : browseCollections.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
          No new collections to discover. Check back later!
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          {browseCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onClick={(c) => navigate(orgPath(`/credentials/${c.id}`))}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

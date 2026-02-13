import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router';
import ProgramCarousel from '~/components/ProgramCarousel';
import BadgeCollectionCarousel from '~/components/BadgeCollectionCarousel';
import { useOrg } from '~/context/OrgContext';
import { useOrgPath } from '~/hooks/useOrgPath';
import { listPrograms, listCollections } from '~/api/generated';
import type { Program, Collection } from '~/api/generated';

export default function Credentials() {
  const { activeOrg } = useOrg();
  const navigate = useNavigate();
  const orgPath = useOrgPath();

  const [programs, setPrograms] = React.useState<Program[]>([]);
  const [isLoadingPrograms, setIsLoadingPrograms] = React.useState(true);

  const [collections, setCollections] = React.useState<Collection[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = React.useState(true);

  React.useEffect(() => {
    if (!activeOrg) return;
    let cancelled = false;

    async function fetchPrograms() {
      setIsLoadingPrograms(true);
      const res = await listPrograms(activeOrg!.org.id, { status: 'active' });
      if (!cancelled && res.status === 200) {
        setPrograms(res.data.data);
      }
      if (!cancelled) setIsLoadingPrograms(false);
    }

    fetchPrograms();
    return () => { cancelled = true; };
  }, [activeOrg]);

  React.useEffect(() => {
    if (!activeOrg) return;
    let cancelled = false;

    async function fetchCollections() {
      setIsLoadingCollections(true);
      const res = await listCollections({ orgId: activeOrg!.org.id });
      if (!cancelled && res.status === 200) {
        setCollections(res.data.data);
      }
      if (!cancelled) setIsLoadingCollections(false);
    }

    fetchCollections();
    return () => { cancelled = true; };
  }, [activeOrg]);

  const handleProgramClick = (program: Program) => {
    navigate(orgPath(`/credentials/programs/${program.slug}`));
  };

  const handleSeeAllPrograms = () => {
    navigate(orgPath('/credentials/programs'));
  };

  const handleCollectionClick = (collection: Collection) => {
    navigate(orgPath(`/credentials/collections/${collection.id}`));
  };

  const handleSeeAllCollections = () => {
    navigate(orgPath('/credentials/collections'));
  };

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Credentials
      </Typography>

      <Stack spacing={3}>
        <ProgramCarousel
          title="Active Programs"
          programs={programs}
          isLoading={isLoadingPrograms}
          onCardClick={handleProgramClick}
          onSeeAll={handleSeeAllPrograms}
        />

        <BadgeCollectionCarousel
          title="Collections"
          collections={collections}
          isLoading={isLoadingCollections}
          onCardClick={handleCollectionClick}
          onSeeAll={handleSeeAllCollections}
        />
      </Stack>
    </Box>
  );
}

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import { useNavigate } from 'react-router';
import { browseRegistry, listOrgCollectionRels } from '~/api/generated';
import { useOrg } from '~/context/OrgContext';
import { useOrgPath } from '~/hooks/useOrgPath';
import type { Collection, OrgCollectionRel } from '~/api/generated';

function getInitials(name: string): string {
  return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

function OrgRelBadge({ rel }: { rel: OrgCollectionRel | undefined }) {
  if (!rel) return null;
  const label = rel.status === 'active' ? 'In Library' : rel.status === 'pending' ? 'Requested' : rel.status;
  const color = rel.status === 'active' ? 'success' : rel.status === 'pending' ? 'warning' : 'default';
  return <Chip label={label} size="small" color={color} variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />;
}

function CatalogCollectionCard({
  collection,
  orgRel,
  onViewDetails,
  onRequest,
  onGoToLibrary,
}: {
  collection: Collection;
  orgRel?: OrgCollectionRel;
  onViewDetails: () => void;
  onRequest: () => void;
  onGoToLibrary: () => void;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}
    >
      <Stack direction="row" gap={1.5} alignItems="flex-start">
        <Avatar
          variant="rounded"
          src={collection.imageUrl}
          sx={{ width: 48, height: 48, borderRadius: 1.5, flexShrink: 0, cursor: 'pointer' }}
          onClick={onViewDetails}
        >
          {getInitials(collection.name)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="flex-start" gap={0.5} flexWrap="wrap">
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
              onClick={onViewDetails}
            >
              {collection.name}
            </Typography>
            <OrgRelBadge rel={orgRel} />
          </Stack>
          {collection.description && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {collection.description}
            </Typography>
          )}
        </Box>
      </Stack>

      <Stack direction="row" alignItems="center" gap={1}>
        <VerifiedOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">
          {collection.badgeCount ?? 0} badges
        </Typography>
        <Button
          size="small"
          variant="text"
          sx={{ ml: 'auto', textTransform: 'none', fontSize: '0.75rem' }}
          endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />}
          onClick={onViewDetails}
        >
          Details
        </Button>
      </Stack>

      {/* CTA based on org relationship status */}
      {!orgRel && (
        <Button
          variant="contained"
          size="small"
          fullWidth
          onClick={onRequest}
          sx={{ textTransform: 'none', mt: 'auto' }}
        >
          Request authorization
        </Button>
      )}
      {orgRel?.status === 'pending' && (
        <Button
          variant="outlined"
          size="small"
          fullWidth
          onClick={onGoToLibrary}
          sx={{ textTransform: 'none', mt: 'auto' }}
        >
          View request
        </Button>
      )}
      {orgRel?.status === 'active' && (
        <Button
          variant="outlined"
          size="small"
          fullWidth
          onClick={onGoToLibrary}
          sx={{ textTransform: 'none', mt: 'auto' }}
        >
          Go to library item
        </Button>
      )}
    </Paper>
  );
}

function CardSkeleton() {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" gap={1.5}>
        <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 1.5, flexShrink: 0 }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton width="70%" height={20} />
          <Skeleton width="90%" height={14} sx={{ mt: 0.5 }} />
        </Box>
      </Stack>
      <Skeleton width="40%" height={14} sx={{ mt: 1 }} />
      <Skeleton variant="rounded" height={32} sx={{ mt: 1, borderRadius: 1 }} />
    </Paper>
  );
}

export default function Catalog() {
  const { activeOrg } = useOrg();
  const navigate = useNavigate();
  const orgPath = useOrgPath();

  const [allCollections, setAllCollections] = React.useState<Collection[]>([]);
  const [orgRels, setOrgRels] = React.useState<OrgCollectionRel[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  React.useEffect(() => {
    if (!activeOrg) return;
    let cancelled = false;

    async function fetchCatalog() {
      setIsLoading(true);
      const [registryRes, relsRes] = await Promise.all([
        browseRegistry({ q: debouncedSearch || undefined }),
        listOrgCollectionRels(activeOrg!.org.id),
      ]);
      if (!cancelled) {
        if (registryRes.status === 200) setAllCollections(registryRes.data.data);
        if (relsRes.status === 200) setOrgRels(relsRes.data.data);
        setIsLoading(false);
      }
    }

    fetchCatalog();
    return () => { cancelled = true; };
  }, [activeOrg, debouncedSearch]);

  const relsByCollectionId = React.useMemo(
    () => Object.fromEntries(orgRels.map((r) => [r.collectionId, r])),
    [orgRels]
  );

  function handleRequest(collection: Collection) {
    navigate(orgPath(`/credentials/catalog/collections/${collection.id}`));
  }

  function handleGoToLibrary(collection: Collection) {
    const rel = relsByCollectionId[collection.id];
    if (rel) navigate(orgPath(`/credentials/collections/${rel.id}`));
  }

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1200px' } }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }} gap={2}>
        <Box>
          <Typography component="h2" variant="h6">Credential Catalog</Typography>
          <Typography variant="body2" color="text.secondary">
            Discover and request access to published credential collections
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          onClick={() => navigate(orgPath('/credentials'))}
          sx={{ textTransform: 'none', flexShrink: 0 }}
        >
          Back to Library
        </Button>
      </Stack>

      <TextField
        size="small"
        placeholder="Search collections…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon sx={{ fontSize: 18 }} />
            </InputAdornment>
          ),
        }}
        sx={{ width: 280, mb: 3 }}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          : allCollections.length === 0
          ? (
            <Box sx={{ gridColumn: '1 / -1', py: 6, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {debouncedSearch ? 'No collections match your search.' : 'No published collections found.'}
              </Typography>
            </Box>
          )
          : allCollections.map((col) => (
            <CatalogCollectionCard
              key={col.id}
              collection={col}
              orgRel={relsByCollectionId[col.id]}
              onViewDetails={() => navigate(orgPath(`/credentials/catalog/collections/${col.id}`))}
              onRequest={() => handleRequest(col)}
              onGoToLibrary={() => handleGoToLibrary(col)}
            />
          ))
        }
      </Box>
    </Box>
  );
}

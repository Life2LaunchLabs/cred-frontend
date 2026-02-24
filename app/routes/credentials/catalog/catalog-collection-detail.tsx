import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import { useNavigate, useParams } from 'react-router';
import { getCollection, listOrgCollectionRels, requestIssueAuthorization } from '~/api/generated';
import { useOrg } from '~/context/OrgContext';
import { useOrgPath } from '~/hooks/useOrgPath';
import type { CollectionDetail, OrgCollectionRel } from '~/api/generated';

function getInitials(name: string): string {
  return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

export default function CatalogCollectionDetail() {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  const orgPath = useOrgPath();
  const { activeOrg } = useOrg();

  const [collection, setCollection] = React.useState<CollectionDetail | null>(null);
  const [orgRel, setOrgRel] = React.useState<OrgCollectionRel | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Request dialog
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [requestMessage, setRequestMessage] = React.useState('');
  const [isRequesting, setIsRequesting] = React.useState(false);
  const [requested, setRequested] = React.useState(false);

  React.useEffect(() => {
    if (!collectionId || !activeOrg) return;
    let cancelled = false;

    async function fetchAll() {
      setIsLoading(true);
      setError(null);
      try {
        const [colRes, relsRes] = await Promise.all([
          getCollection(collectionId!),
          listOrgCollectionRels(activeOrg!.org.id),
        ]);
        if (!cancelled) {
          if (colRes.status === 200) {
            setCollection(colRes.data);
          } else {
            setError('Collection not found');
          }
          if (relsRes.status === 200) {
            const existing = relsRes.data.data.find((r) => r.collectionId === collectionId);
            setOrgRel(existing);
          }
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) { setError('Failed to load'); setIsLoading(false); }
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [collectionId, activeOrg]);

  async function handleSubmitRequest() {
    if (!collectionId || !activeOrg) return;
    setIsRequesting(true);
    await requestIssueAuthorization(collectionId, {
      requestingOrgId: activeOrg.org.id,
      message: requestMessage,
    });
    setIsRequesting(false);
    setDialogOpen(false);
    setRequested(true);
  }

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', maxWidth: 820 }}>
        <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
        <Stack direction="row" alignItems="flex-end" gap={2} sx={{ px: 3, mt: -5 }}>
          <Skeleton variant="rounded" width={72} height={72} />
          <Skeleton width={200} height={28} />
        </Stack>
        <Box sx={{ px: 3, mt: 2 }}>
          {[1, 2, 3].map((i) => <Skeleton key={i} height={48} sx={{ mb: 1 }} />)}
        </Box>
      </Box>
    );
  }

  if (error || !collection) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary" sx={{ mb: 2 }}>{error ?? 'Not found'}</Typography>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(orgPath('/credentials/catalog'))}>
          Back to Catalog
        </Button>
      </Box>
    );
  }

  const canRequest = !orgRel && !requested;
  const isPending = orgRel?.status === 'pending' || requested;
  const isActive = orgRel?.status === 'active';

  return (
    <Box sx={{ width: '100%', maxWidth: 820, pb: 4 }}>
      {/* Cover */}
      <Box sx={{ position: 'relative', height: { xs: 140, sm: 180 }, borderRadius: 2, overflow: 'hidden', bgcolor: 'grey.200' }}>
        {collection.imageUrl ? (
          <Box component="img" src={collection.imageUrl} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Box sx={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1B2845 0%, #274060 50%, #1B6B93 100%)' }} />
        )}
      </Box>

      {/* Avatar + name */}
      <Stack direction="row" alignItems="flex-end" gap={2} sx={{ px: 3, mt: -5 }}>
        <Avatar
          variant="rounded"
          src={collection.imageUrl}
          sx={{ width: 72, height: 72, borderRadius: 2, border: '4px solid', borderColor: 'background.paper', bgcolor: 'grey.300', fontSize: '1.5rem', fontWeight: 700 }}
        >
          {getInitials(collection.name)}
        </Avatar>
        <Stack gap={0.5} sx={{ flex: 1, pb: 0.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{collection.name}</Typography>
        </Stack>
      </Stack>

      {/* Back + chips */}
      <Stack direction="row" alignItems="center" gap={1} sx={{ px: 3, mt: 1.5 }}>
        <Button
          size="small"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate(orgPath('/credentials/catalog'))}
          sx={{ textTransform: 'none' }}
        >
          Catalog
        </Button>
        <Chip label="Published" size="small" color="success" variant="outlined" />
        {(isPending || isActive) && (
          <Chip
            label={isActive ? 'In Your Library' : 'Request Pending'}
            size="small"
            color={isActive ? 'success' : 'warning'}
          />
        )}
      </Stack>

      {/* Description */}
      {collection.description && (
        <Typography variant="body1" color="text.secondary" sx={{ px: 3, mt: 1.5, maxWidth: 600, lineHeight: 1.6 }}>
          {collection.description}
        </Typography>
      )}

      {/* Meta */}
      <Stack direction="row" gap={2.5} sx={{ px: 3, mt: 1.5, color: 'text.secondary' }} flexWrap="wrap">
        <Stack direction="row" alignItems="center" gap={0.5}>
          <VerifiedOutlinedIcon sx={{ fontSize: 16 }} />
          <Typography variant="caption">{collection.badgeCount ?? 0} badges</Typography>
        </Stack>
      </Stack>

      {/* Org context panel */}
      <Box sx={{ px: 3, mt: 3 }}>
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
            {isActive ? 'Already in your library' : isPending ? 'Authorization request pending' : 'Request access for your org'}
          </Typography>

          {isActive && (
            <Stack direction="row" gap={1} alignItems="center">
              <CheckCircleRoundedIcon color="success" />
              <Typography variant="body2" color="text.secondary">
                Your org has active access to this collection.
              </Typography>
              <Button
                size="small"
                variant="contained"
                onClick={() => navigate(orgPath(`/credentials/collections/${orgRel!.id}`))}
                sx={{ ml: 'auto', textTransform: 'none' }}
              >
                Go to library item
              </Button>
            </Stack>
          )}

          {isPending && !isActive && (
            <Typography variant="body2" color="text.secondary">
              An authorization request has been submitted. The collection owner will review and respond.
            </Typography>
          )}

          {canRequest && (
            <Stack gap={1.5}>
              <Typography variant="body2" color="text.secondary">
                Your org needs authorization from the collection creator to use these badges. Submit a request below.
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={() => setDialogOpen(true)}
                sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
              >
                Request authorization
              </Button>
            </Stack>
          )}
        </Paper>
      </Box>

      {/* Badge list */}
      {(collection.badgeSummaries?.length ?? 0) > 0 && (
        <Box sx={{ px: 3, mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
            Badges in this collection
          </Typography>
          <Stack gap={1}>
            {collection.badgeSummaries!.map((badge) => (
              <Paper
                key={badge.id}
                variant="outlined"
                onClick={() => navigate(orgPath(`/credentials/catalog/badges/${badge.id}?from=${collectionId}`))}
                sx={{ p: 1.5, display: 'flex', gap: 1.5, alignItems: 'center', cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
              >
                <Avatar variant="rounded" src={badge.imageUrl} sx={{ width: 36, height: 36, borderRadius: 1 }}>
                  {getInitials(badge.name)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {badge.name}
                  </Typography>
                  {badge.description && (
                    <Typography variant="caption" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                      {badge.description}
                    </Typography>
                  )}
                </Box>
                {badge.issuanceCount != null && (
                  <Typography variant="caption" color="text.secondary">
                    {badge.issuanceCount.toLocaleString()} issued
                  </Typography>
                )}
              </Paper>
            ))}
          </Stack>
        </Box>
      )}

      {/* Request authorization dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request authorization</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Describe how your org plans to use <strong>{collection.name}</strong>. The creator will review your request.
          </Typography>
          <TextField
            label="Message to creator (optional)"
            multiline
            rows={4}
            fullWidth
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            placeholder="e.g. We're launching a welding certification program for apprentices starting Q1 2026…"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitRequest}
            disabled={isRequesting}
            sx={{ textTransform: 'none' }}
          >
            Submit request
          </Button>
        </DialogActions>
      </Dialog>

      <Divider sx={{ mx: 3, mt: 3 }} />
    </Box>
  );
}

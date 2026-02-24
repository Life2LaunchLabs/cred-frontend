import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { getBadge, getCollection, listOrgCollectionRels, requestIssueAuthorization } from '~/api/generated';
import { useOrg } from '~/context/OrgContext';
import { useOrgPath } from '~/hooks/useOrgPath';
import type { Badge, Collection, OrgCollectionRel } from '~/api/generated';

function getInitials(name: string): string {
  return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

export default function CatalogBadgeDetail() {
  const { badgeId } = useParams<{ badgeId: string }>();
  const [searchParams] = useSearchParams();
  const fromCollectionId = searchParams.get('from');
  const navigate = useNavigate();
  const orgPath = useOrgPath();
  const { activeOrg } = useOrg();

  const [badge, setBadge] = React.useState<Badge | null>(null);
  const [parentCollection, setParentCollection] = React.useState<Collection | null>(null);
  const [orgRel, setOrgRel] = React.useState<OrgCollectionRel | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Request dialog
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [requestMessage, setRequestMessage] = React.useState('');
  const [isRequesting, setIsRequesting] = React.useState(false);
  const [requested, setRequested] = React.useState(false);

  React.useEffect(() => {
    if (!badgeId || !activeOrg) return;
    let cancelled = false;

    async function fetchAll() {
      setIsLoading(true);
      setError(null);
      try {
        const fetches: Promise<unknown>[] = [
          getBadge(badgeId!),
          listOrgCollectionRels(activeOrg!.org.id),
        ];
        if (fromCollectionId) fetches.push(getCollection(fromCollectionId));

        const [badgeRes, relsRes, colRes] = await Promise.all(fetches) as Awaited<[
          ReturnType<typeof getBadge>,
          ReturnType<typeof listOrgCollectionRels>,
          ReturnType<typeof getCollection> | undefined,
        ]>;

        if (!cancelled) {
          if (badgeRes.status === 200) {
            setBadge(badgeRes.data);
          } else {
            setError('Badge not found');
          }
          if (relsRes.status === 200 && fromCollectionId) {
            const existing = relsRes.data.data.find((r) => r.collectionId === fromCollectionId);
            setOrgRel(existing);
          }
          if (colRes && colRes.status === 200) {
            setParentCollection(colRes.data);
          }
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) { setError('Failed to load'); setIsLoading(false); }
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [badgeId, fromCollectionId, activeOrg]);

  async function handleSubmitRequest() {
    if (!fromCollectionId || !activeOrg) return;
    setIsRequesting(true);
    await requestIssueAuthorization(fromCollectionId, {
      requestingOrgId: activeOrg.org.id,
      message: requestMessage,
    });
    setIsRequesting(false);
    setDialogOpen(false);
    setRequested(true);
  }

  function handleBack() {
    if (fromCollectionId) {
      navigate(orgPath(`/credentials/catalog/collections/${fromCollectionId}`));
    } else {
      navigate(orgPath('/credentials/catalog'));
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', maxWidth: 720, p: 3 }}>
        <Skeleton variant="rounded" width={72} height={72} sx={{ mb: 2 }} />
        <Skeleton width="50%" height={28} />
        <Skeleton width="80%" height={18} sx={{ mt: 1 }} />
        {[1, 2, 3].map((i) => <Skeleton key={i} height={40} sx={{ mt: 1 }} />)}
      </Box>
    );
  }

  if (error || !badge) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary" sx={{ mb: 2 }}>{error ?? 'Not found'}</Typography>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={handleBack}>
          Back
        </Button>
      </Box>
    );
  }

  const requiredCriteria = badge.criteria?.filter((c) => c.isRequired) ?? [];
  const optionalCriteria = badge.criteria?.filter((c) => !c.isRequired) ?? [];
  const canRequest = fromCollectionId && !orgRel && !requested;
  const isPending = orgRel?.status === 'pending' || requested;
  const isActive = orgRel?.status === 'active';

  return (
    <Box sx={{ width: '100%', maxWidth: 720, pb: 4 }}>
      {/* Badge header */}
      <Stack direction="row" gap={2} alignItems="flex-start" sx={{ mb: 0.5 }}>
        <Avatar
          variant="rounded"
          src={badge.imageUrl}
          sx={{ width: 72, height: 72, borderRadius: 2, bgcolor: 'grey.200', fontSize: '1.5rem', fontWeight: 700, flexShrink: 0 }}
        >
          {getInitials(badge.name)}
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{badge.name}</Typography>
          {badge.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 540 }}>
              {badge.description}
            </Typography>
          )}
        </Box>
      </Stack>

      {/* Back + status chips */}
      <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 1.5, mb: 2 }} flexWrap="wrap">
        <Button
          size="small"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={handleBack}
          sx={{ textTransform: 'none' }}
        >
          {parentCollection ? parentCollection.name : 'Catalog'}
        </Button>
        <Chip label="Published" size="small" color="success" variant="outlined" />
        {(isPending || isActive) && (
          <Chip
            label={isActive ? 'Collection In Library' : 'Request Pending'}
            size="small"
            color={isActive ? 'success' : 'warning'}
          />
        )}
      </Stack>

      {/* Criteria */}
      {(requiredCriteria.length > 0 || optionalCriteria.length > 0) && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Criteria</Typography>

          {requiredCriteria.length > 0 && (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                Required
              </Typography>
              <List dense disablePadding>
                {requiredCriteria.map((c) => (
                  <ListItem key={c.id} disableGutters sx={{ py: 0.25 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <CheckCircleOutlineRoundedIcon color="primary" sx={{ fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText primary={c.label} primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {optionalCriteria.length > 0 && (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem', mt: requiredCriteria.length > 0 ? 1.5 : 0, display: 'block' }}>
                Optional
              </Typography>
              <List dense disablePadding>
                {optionalCriteria.map((c) => (
                  <ListItem key={c.id} disableGutters sx={{ py: 0.25 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <RadioButtonUncheckedRoundedIcon color="disabled" sx={{ fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={c.label}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Paper>
      )}

      {/* Org context panel (only when we know the parent collection) */}
      {fromCollectionId && (
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
            {isActive
              ? 'Collection already in your library'
              : isPending
              ? 'Authorization request pending'
              : 'Request access for your org'}
          </Typography>

          {isActive && (
            <Stack direction="row" gap={1} alignItems="center">
              <CheckCircleRoundedIcon color="success" />
              <Typography variant="body2" color="text.secondary">
                Your org is authorized to use badges from this collection.
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
              An authorization request has been submitted for this collection. The owner will review and respond.
            </Typography>
          )}

          {canRequest && (
            <Stack gap={1.5}>
              <Typography variant="body2" color="text.secondary">
                Your org needs authorization to use this badge. Authorization is granted at the collection level.
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate(orgPath(`/credentials/catalog/collections/${fromCollectionId}`))}
                sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
              >
                Request access via collection
              </Button>
            </Stack>
          )}
        </Paper>
      )}

      {/* Request authorization dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request authorization</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Authorization is granted at the collection level. Describe how your org plans to use these badges.
          </Typography>
          <TextField
            label="Message to creator (optional)"
            multiline
            rows={4}
            fullWidth
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
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
    </Box>
  );
}

import * as React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { NavLink, useLocation, useParams } from 'react-router';
import { getCollection, listCollections } from '~/api/generated';
import { useOrg } from '~/context/OrgContext';

type TreeNode = {
  id: string;
  label: string;
  to: string;
  children?: TreeNode[];
};

type BadgesTreeData = {
  nodes: TreeNode[];
};

type BadgesPathState = {
  inScope: boolean;
  collectionId: string | null;
  badgeId: string | null;
};

const BADGES_STATIC_ROUTES = new Set(['browse', 'create']);

function parseBadgesPath(pathname: string, orgSlug?: string): BadgesPathState {
  if (!orgSlug) {
    return { inScope: false, collectionId: null, badgeId: null };
  }

  const badgesRoot = `/${orgSlug}/badges`;
  if (!pathname.startsWith(badgesRoot)) {
    return { inScope: false, collectionId: null, badgeId: null };
  }

  const pathAfterBadges = pathname.slice(badgesRoot.length);
  const [segment1, segment2] = pathAfterBadges.split('/').filter(Boolean);

  if (!segment1 || BADGES_STATIC_ROUTES.has(segment1)) {
    return { inScope: true, collectionId: null, badgeId: null };
  }

  return {
    inScope: true,
    collectionId: segment1,
    badgeId: segment2 ?? null,
  };
}

function renderTreeNodes(nodes: TreeNode[]) {
  return nodes.map((node) => (
    <TreeItem
      key={node.id}
      itemId={node.id}
      label={
        <Link
          component={NavLink}
          to={node.to}
          color="inherit"
          underline="none"
          sx={{
            display: 'inline-block',
            width: '100%',
            py: 0.5,
            pr: 1,
          }}
        >
          {node.label}
        </Link>
      }
    >
      {node.children ? renderTreeNodes(node.children) : null}
    </TreeItem>
  ));
}

export default function ContextualSidebarTree() {
  const { activeOrg } = useOrg();
  const { orgSlug } = useParams();
  const location = useLocation();
  const [isLoading, setIsLoading] = React.useState(false);
  const [treeData, setTreeData] = React.useState<BadgesTreeData | null>(null);
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
  const activeOrgId = activeOrg?.org.id;

  const pathState = React.useMemo(
    () => parseBadgesPath(location.pathname, orgSlug),
    [location.pathname, orgSlug]
  );

  React.useEffect(() => {
    if (!activeOrgId || !orgSlug || !pathState.inScope) {
      return;
    }

    let cancelled = false;

    async function loadBadgesTree() {
      setIsLoading(true);
      const collectionsRes = await listCollections({ orgId: activeOrgId });

      if (cancelled) return;
      if (collectionsRes.status !== 200) {
        setTreeData({ nodes: [] });
        setIsLoading(false);
        return;
      }

      const detailResults = await Promise.all(
        collectionsRes.data.data.map(async (collection) => {
          try {
            const res = await getCollection(collection.id);
            if (res.status === 200) {
              return res.data;
            }
          } catch {
            // Gracefully degrade to collection-only node.
          }
          return null;
        })
      );

      if (cancelled) return;

      const detailsByCollectionId = new Map(
        detailResults
          .filter((detail): detail is NonNullable<typeof detail> => detail !== null)
          .map((detail) => [detail.id, detail])
      );

      const nodes: TreeNode[] = collectionsRes.data.data.map((collection) => {
        const detail = detailsByCollectionId.get(collection.id);
        const children =
          detail?.badgeSummaries?.map((badge) => ({
            id: `badge:${badge.id}`,
            label: badge.name,
            to: `/${orgSlug}/badges/${collection.id}/${badge.id}`,
          })) ?? [];

        return {
          id: `collection:${collection.id}`,
          label: collection.name,
          to: `/${orgSlug}/badges/${collection.id}`,
          children,
        };
      });

      setTreeData({ nodes });
      setIsLoading(false);
    }

    loadBadgesTree();

    return () => {
      cancelled = true;
    };
  }, [activeOrgId, orgSlug, pathState.inScope]);

  const selectedItemId = pathState.badgeId
    ? `badge:${pathState.badgeId}`
    : pathState.collectionId
      ? `collection:${pathState.collectionId}`
      : undefined;

  React.useEffect(() => {
    if (!pathState.inScope) {
      setTreeData(null);
      setExpandedItems([]);
      return;
    }

    if (pathState.collectionId) {
      const activeCollection = `collection:${pathState.collectionId}`;
      setExpandedItems((prev) => (prev.includes(activeCollection) ? prev : [...prev, activeCollection]));
    }
  }, [pathState.inScope, pathState.collectionId]);

  if (!pathState.inScope) {
    return null;
  }

  return (
    <>
      <Divider />
      <Box sx={{ px: 1.5, py: 1.25 }}>
        <Stack spacing={1}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, px: 0.5 }}>
            Collection navigation
          </Typography>

          {isLoading && !treeData ? (
            <Stack alignItems="center" sx={{ py: 2 }}>
              <CircularProgress size={18} />
            </Stack>
          ) : (
            <SimpleTreeView
              selectedItems={selectedItemId}
              expandedItems={expandedItems}
              onExpandedItemsChange={(_, itemIds) => setExpandedItems(itemIds)}
              sx={{
                '& .MuiTreeItem-content': {
                  borderRadius: 1,
                },
                '& .MuiTreeItem-content.Mui-selected': {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14),
                },
                '& .MuiTreeItem-content.Mui-selected:hover': {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
                },
              }}
            >
              {treeData ? renderTreeNodes(treeData.nodes) : null}
            </SimpleTreeView>
          )}
        </Stack>
      </Box>
    </>
  );
}

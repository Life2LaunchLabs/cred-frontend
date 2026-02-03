import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridEventListener,
  gridClasses,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// ============================================================================
// TYPES & DATA
// ============================================================================

type UserRole = 'Admin' | 'Editor' | 'Viewer';
type UserStatus = 'Active' | 'Inactive' | 'Pending';

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
  isVerified: boolean;
}

const INITIAL_USERS: User[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active', lastLogin: '2024-01-15T10:30:00Z', isVerified: true },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', status: 'Active', lastLogin: '2024-01-14T14:22:00Z', isVerified: true },
  { id: 3, name: 'Carol Davis', email: 'carol@example.com', role: 'Viewer', status: 'Inactive', lastLogin: '2024-01-10T09:15:00Z', isVerified: false },
  { id: 4, name: 'David Wilson', email: 'david@example.com', role: 'Editor', status: 'Active', lastLogin: '2024-01-15T08:45:00Z', isVerified: true },
  { id: 5, name: 'Eva Martinez', email: 'eva@example.com', role: 'Viewer', status: 'Pending', lastLogin: '2024-01-12T16:30:00Z', isVerified: false },
  { id: 6, name: 'Frank Brown', email: 'frank@example.com', role: 'Admin', status: 'Active', lastLogin: '2024-01-15T11:00:00Z', isVerified: true },
  { id: 7, name: 'Grace Lee', email: 'grace@example.com', role: 'Editor', status: 'Active', lastLogin: '2024-01-13T13:20:00Z', isVerified: true },
  { id: 8, name: 'Henry Taylor', email: 'henry@example.com', role: 'Viewer', status: 'Inactive', lastLogin: '2024-01-08T10:00:00Z', isVerified: false },
];

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function renderStatus(status: UserStatus) {
  const colors: Record<UserStatus, 'success' | 'default' | 'warning'> = {
    Active: 'success',
    Inactive: 'default',
    Pending: 'warning',
  };
  return <Chip label={status} color={colors[status]} size="small" />;
}

function renderRole(role: UserRole) {
  const colors: Record<UserRole, 'error' | 'primary' | 'default'> = {
    Admin: 'error',
    Editor: 'primary',
    Viewer: 'default',
  };
  return <Chip label={role} color={colors[role]} size="small" variant="outlined" />;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

type ViewMode = 'list' | 'show' | 'edit' | 'create';

export default function UsersGrid() {
  const [users, setUsers] = React.useState<User[]>(INITIAL_USERS);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // View state
  const [viewMode, setViewMode] = React.useState<ViewMode>('list');
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null);

  // Snackbar state
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Form state
  const [formValues, setFormValues] = React.useState<Partial<User>>({});

  const handleRefresh = React.useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setUsers(INITIAL_USERS);
      setIsLoading(false);
      setSnackbar({ open: true, message: 'Data refreshed', severity: 'success' });
    }, 500);
  }, []);

  const handleRowClick = React.useCallback<GridEventListener<'rowClick'>>(({ row }) => {
    setSelectedUser(row);
    setViewMode('show');
  }, []);

  const handleCreate = React.useCallback(() => {
    setFormValues({ role: 'Viewer', status: 'Pending', isVerified: false });
    setViewMode('create');
  }, []);

  const handleEdit = React.useCallback((user: User) => () => {
    setSelectedUser(user);
    setFormValues(user);
    setViewMode('edit');
  }, []);

  const handleDeleteClick = React.useCallback((user: User) => () => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = React.useCallback(() => {
    if (userToDelete) {
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
    }
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  }, [userToDelete]);

  const handleBack = React.useCallback(() => {
    setViewMode('list');
    setSelectedUser(null);
    setFormValues({});
  }, []);

  const handleFormSubmit = React.useCallback(() => {
    if (viewMode === 'create') {
      const newUser: User = {
        id: Math.max(...users.map(u => u.id)) + 1,
        name: formValues.name || '',
        email: formValues.email || '',
        role: formValues.role || 'Viewer',
        status: formValues.status || 'Pending',
        lastLogin: new Date().toISOString(),
        isVerified: formValues.isVerified || false,
      };
      setUsers(prev => [...prev, newUser]);
      setSnackbar({ open: true, message: 'User created successfully', severity: 'success' });
    } else if (viewMode === 'edit' && selectedUser) {
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, ...formValues } : u));
      setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
    }
    handleBack();
  }, [viewMode, formValues, selectedUser, users, handleBack]);

  const columns = React.useMemo<GridColDef[]>(() => [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'role', headerName: 'Role', width: 120, renderCell: (params) => renderRole(params.value) },
    { field: 'status', headerName: 'Status', width: 120, renderCell: (params) => renderStatus(params.value) },
    { field: 'isVerified', headerName: 'Verified', type: 'boolean', width: 100 },
    {
      field: 'lastLogin',
      headerName: 'Last Login',
      width: 180,
      valueFormatter: (value) => value ? new Date(value).toLocaleString() : 'Never',
    },
    {
      field: 'actions',
      type: 'actions',
      width: 100,
      getActions: ({ row }) => [
        <GridActionsCellItem key="edit" icon={<EditIcon />} label="Edit" onClick={handleEdit(row)} />,
        <GridActionsCellItem key="delete" icon={<DeleteIcon />} label="Delete" onClick={handleDeleteClick(row)} />,
      ],
    },
  ], [handleEdit, handleDeleteClick]);

  // ============================================================================
  // RENDER: SHOW VIEW
  // ============================================================================
  if (viewMode === 'show' && selectedUser) {
    return (
      <Box>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Name</Typography>
              <Typography variant="body1">{selectedUser.name}</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Email</Typography>
              <Typography variant="body1">{selectedUser.email}</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Role</Typography>
              <Box sx={{ mt: 0.5 }}>{renderRole(selectedUser.role)}</Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Status</Typography>
              <Box sx={{ mt: 0.5 }}>{renderStatus(selectedUser.status)}</Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Verified</Typography>
              <Typography variant="body1">{selectedUser.isVerified ? 'Yes' : 'No'}</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Last Login</Typography>
              <Typography variant="body1">{new Date(selectedUser.lastLogin).toLocaleString()}</Typography>
            </Paper>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={handleBack}>Back</Button>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" startIcon={<EditIcon />} onClick={handleEdit(selectedUser)}>Edit</Button>
            <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={handleDeleteClick(selectedUser)}>Delete</Button>
          </Stack>
        </Stack>
      </Box>
    );
  }

  // ============================================================================
  // RENDER: CREATE/EDIT VIEW
  // ============================================================================
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <Box component="form" onSubmit={(e) => { e.preventDefault(); handleFormSubmit(); }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Name"
              value={formValues.name || ''}
              onChange={(e) => setFormValues(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formValues.email || ''}
              onChange={(e) => setFormValues(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formValues.role || 'Viewer'}
                label="Role"
                onChange={(e: SelectChangeEvent) => setFormValues(prev => ({ ...prev, role: e.target.value as UserRole }))}
              >
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Editor">Editor</MenuItem>
                <MenuItem value="Viewer">Viewer</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formValues.status || 'Pending'}
                label="Status"
                onChange={(e: SelectChangeEvent) => setFormValues(prev => ({ ...prev, status: e.target.value as UserStatus }))}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formValues.isVerified || false}
                  onChange={(e) => setFormValues(prev => ({ ...prev, isVerified: e.target.checked }))}
                />
              }
              label="Verified"
            />
          </Grid>
        </Grid>
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={handleBack}>Back</Button>
          <Button type="submit" variant="contained" size="large">
            {viewMode === 'create' ? 'Create' : 'Save'}
          </Button>
        </Stack>
      </Box>
    );
  }

  // ============================================================================
  // RENDER: LIST VIEW
  // ============================================================================
  return (
    <Box>
      <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mb: 2 }}>
        <Tooltip title="Reload data">
          <IconButton size="small" onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Add User
        </Button>
      </Stack>

      {error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <DataGrid
          rows={users}
          columns={columns}
          loading={isLoading}
          onRowClick={handleRowClick}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
          autoHeight
          sx={{
            [`& .${gridClasses.row}:hover`]: { cursor: 'pointer' },
            [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: { outline: 'transparent' },
            [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]: { outline: 'none' },
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User?</DialogTitle>
        <DialogContent>
          Do you wish to delete {userToDelete?.name}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        action={
          <IconButton size="small" color="inherit" onClick={() => setSnackbar(prev => ({ ...prev, open: false }))}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

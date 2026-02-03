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

type Department = 'Engineering' | 'Marketing' | 'Sales' | 'HR' | 'Finance' | 'Operations';
type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Intern';

interface StaffMember {
  id: number;
  name: string;
  email: string;
  department: Department;
  position: string;
  employmentType: EmploymentType;
  hireDate: string;
  isActive: boolean;
  phone: string;
}

const INITIAL_STAFF: StaffMember[] = [
  { id: 1, name: 'Michael Chen', email: 'michael.chen@company.com', department: 'Engineering', position: 'Senior Developer', employmentType: 'Full-time', hireDate: '2022-03-15', isActive: true, phone: '(555) 123-4567' },
  { id: 2, name: 'Sarah Williams', email: 'sarah.w@company.com', department: 'Marketing', position: 'Marketing Manager', employmentType: 'Full-time', hireDate: '2021-08-20', isActive: true, phone: '(555) 234-5678' },
  { id: 3, name: 'James Rodriguez', email: 'james.r@company.com', department: 'Sales', position: 'Sales Representative', employmentType: 'Full-time', hireDate: '2023-01-10', isActive: true, phone: '(555) 345-6789' },
  { id: 4, name: 'Emily Thompson', email: 'emily.t@company.com', department: 'HR', position: 'HR Coordinator', employmentType: 'Full-time', hireDate: '2022-06-01', isActive: true, phone: '(555) 456-7890' },
  { id: 5, name: 'David Park', email: 'david.p@company.com', department: 'Finance', position: 'Financial Analyst', employmentType: 'Full-time', hireDate: '2023-04-15', isActive: true, phone: '(555) 567-8901' },
  { id: 6, name: 'Lisa Anderson', email: 'lisa.a@company.com', department: 'Operations', position: 'Operations Manager', employmentType: 'Full-time', hireDate: '2020-11-30', isActive: true, phone: '(555) 678-9012' },
  { id: 7, name: 'Robert Kim', email: 'robert.k@company.com', department: 'Engineering', position: 'Junior Developer', employmentType: 'Full-time', hireDate: '2023-09-01', isActive: true, phone: '(555) 789-0123' },
  { id: 8, name: 'Jennifer Lopez', email: 'jennifer.l@company.com', department: 'Marketing', position: 'Content Writer', employmentType: 'Part-time', hireDate: '2023-07-15', isActive: true, phone: '(555) 890-1234' },
  { id: 9, name: 'Daniel Brown', email: 'daniel.b@company.com', department: 'Sales', position: 'Sales Director', employmentType: 'Full-time', hireDate: '2019-05-20', isActive: true, phone: '(555) 901-2345' },
  { id: 10, name: 'Amanda White', email: 'amanda.w@company.com', department: 'Engineering', position: 'QA Engineer', employmentType: 'Contract', hireDate: '2024-01-02', isActive: true, phone: '(555) 012-3456' },
];

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function renderDepartment(department: Department) {
  const colors: Record<Department, 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error'> = {
    Engineering: 'primary',
    Marketing: 'secondary',
    Sales: 'success',
    HR: 'warning',
    Finance: 'info',
    Operations: 'error',
  };
  return <Chip label={department} color={colors[department]} size="small" />;
}

function renderEmploymentType(type: EmploymentType) {
  const colors: Record<EmploymentType, 'success' | 'warning' | 'info' | 'default'> = {
    'Full-time': 'success',
    'Part-time': 'warning',
    Contract: 'info',
    Intern: 'default',
  };
  return <Chip label={type} color={colors[type]} size="small" variant="outlined" />;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

type ViewMode = 'list' | 'show' | 'edit' | 'create';

export default function StaffGrid() {
  const [staff, setStaff] = React.useState<StaffMember[]>(INITIAL_STAFF);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // View state
  const [viewMode, setViewMode] = React.useState<ViewMode>('list');
  const [selectedStaff, setSelectedStaff] = React.useState<StaffMember | null>(null);

  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [staffToDelete, setStaffToDelete] = React.useState<StaffMember | null>(null);

  // Snackbar state
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Form state
  const [formValues, setFormValues] = React.useState<Partial<StaffMember>>({});

  const handleRefresh = React.useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setStaff(INITIAL_STAFF);
      setIsLoading(false);
      setSnackbar({ open: true, message: 'Data refreshed', severity: 'success' });
    }, 500);
  }, []);

  const handleRowClick = React.useCallback<GridEventListener<'rowClick'>>(({ row }) => {
    setSelectedStaff(row);
    setViewMode('show');
  }, []);

  const handleCreate = React.useCallback(() => {
    setFormValues({ department: 'Engineering', employmentType: 'Full-time', isActive: true });
    setViewMode('create');
  }, []);

  const handleEdit = React.useCallback((member: StaffMember) => () => {
    setSelectedStaff(member);
    setFormValues(member);
    setViewMode('edit');
  }, []);

  const handleDeleteClick = React.useCallback((member: StaffMember) => () => {
    setStaffToDelete(member);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = React.useCallback(() => {
    if (staffToDelete) {
      setStaff(prev => prev.filter(s => s.id !== staffToDelete.id));
      setSnackbar({ open: true, message: 'Staff member removed successfully', severity: 'success' });
    }
    setDeleteDialogOpen(false);
    setStaffToDelete(null);
  }, [staffToDelete]);

  const handleBack = React.useCallback(() => {
    setViewMode('list');
    setSelectedStaff(null);
    setFormValues({});
  }, []);

  const handleFormSubmit = React.useCallback(() => {
    if (viewMode === 'create') {
      const newStaff: StaffMember = {
        id: Math.max(...staff.map(s => s.id)) + 1,
        name: formValues.name || '',
        email: formValues.email || '',
        department: formValues.department || 'Engineering',
        position: formValues.position || '',
        employmentType: formValues.employmentType || 'Full-time',
        hireDate: formValues.hireDate || new Date().toISOString().split('T')[0],
        isActive: formValues.isActive ?? true,
        phone: formValues.phone || '',
      };
      setStaff(prev => [...prev, newStaff]);
      setSnackbar({ open: true, message: 'Staff member added successfully', severity: 'success' });
    } else if (viewMode === 'edit' && selectedStaff) {
      setStaff(prev => prev.map(s => s.id === selectedStaff.id ? { ...s, ...formValues } : s));
      setSnackbar({ open: true, message: 'Staff member updated successfully', severity: 'success' });
    }
    handleBack();
  }, [viewMode, formValues, selectedStaff, staff, handleBack]);

  const columns = React.useMemo<GridColDef[]>(() => [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'position', headerName: 'Position', flex: 1, minWidth: 150 },
    { field: 'department', headerName: 'Department', width: 140, renderCell: (params) => renderDepartment(params.value) },
    { field: 'employmentType', headerName: 'Type', width: 120, renderCell: (params) => renderEmploymentType(params.value) },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    {
      field: 'hireDate',
      headerName: 'Hire Date',
      width: 120,
      valueFormatter: (value) => value ? new Date(value).toLocaleDateString() : '',
    },
    { field: 'isActive', headerName: 'Active', type: 'boolean', width: 80 },
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
  if (viewMode === 'show' && selectedStaff) {
    return (
      <Box>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Name</Typography>
              <Typography variant="body1">{selectedStaff.name}</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Email</Typography>
              <Typography variant="body1">{selectedStaff.email}</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Position</Typography>
              <Typography variant="body1">{selectedStaff.position}</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Department</Typography>
              <Box sx={{ mt: 0.5 }}>{renderDepartment(selectedStaff.department)}</Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Employment Type</Typography>
              <Box sx={{ mt: 0.5 }}>{renderEmploymentType(selectedStaff.employmentType)}</Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Phone</Typography>
              <Typography variant="body1">{selectedStaff.phone}</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Hire Date</Typography>
              <Typography variant="body1">{new Date(selectedStaff.hireDate).toLocaleDateString()}</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Status</Typography>
              <Typography variant="body1">{selectedStaff.isActive ? 'Active' : 'Inactive'}</Typography>
            </Paper>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={handleBack}>Back</Button>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" startIcon={<EditIcon />} onClick={handleEdit(selectedStaff)}>Edit</Button>
            <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={handleDeleteClick(selectedStaff)}>Delete</Button>
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
            <TextField
              fullWidth
              label="Position"
              value={formValues.position || ''}
              onChange={(e) => setFormValues(prev => ({ ...prev, position: e.target.value }))}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={formValues.department || 'Engineering'}
                label="Department"
                onChange={(e: SelectChangeEvent) => setFormValues(prev => ({ ...prev, department: e.target.value as Department }))}
              >
                <MenuItem value="Engineering">Engineering</MenuItem>
                <MenuItem value="Marketing">Marketing</MenuItem>
                <MenuItem value="Sales">Sales</MenuItem>
                <MenuItem value="HR">HR</MenuItem>
                <MenuItem value="Finance">Finance</MenuItem>
                <MenuItem value="Operations">Operations</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Employment Type</InputLabel>
              <Select
                value={formValues.employmentType || 'Full-time'}
                label="Employment Type"
                onChange={(e: SelectChangeEvent) => setFormValues(prev => ({ ...prev, employmentType: e.target.value as EmploymentType }))}
              >
                <MenuItem value="Full-time">Full-time</MenuItem>
                <MenuItem value="Part-time">Part-time</MenuItem>
                <MenuItem value="Contract">Contract</MenuItem>
                <MenuItem value="Intern">Intern</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Phone"
              value={formValues.phone || ''}
              onChange={(e) => setFormValues(prev => ({ ...prev, phone: e.target.value }))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Hire Date"
              type="date"
              value={formValues.hireDate || ''}
              onChange={(e) => setFormValues(prev => ({ ...prev, hireDate: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formValues.isActive ?? true}
                  onChange={(e) => setFormValues(prev => ({ ...prev, isActive: e.target.checked }))}
                />
              }
              label="Active"
            />
          </Grid>
        </Grid>
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={handleBack}>Back</Button>
          <Button type="submit" variant="contained" size="large">
            {viewMode === 'create' ? 'Add Staff' : 'Save'}
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
          Add Staff
        </Button>
      </Stack>

      {error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <DataGrid
          rows={staff}
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
        <DialogTitle>Remove Staff Member?</DialogTitle>
        <DialogContent>
          Do you wish to remove {staffToDelete?.name} from the organization?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Remove</Button>
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

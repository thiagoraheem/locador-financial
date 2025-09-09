import React, { useEffect, useState } from 'react';
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
} from '@mui/x-data-grid';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchCategorias,
  deleteCategoria,
  setFilters,
  setPagination,
} from '../../store/slices/categoriasSlice';
import { CategoriaResponse } from '../../services/categoriasApi';

interface CategoriasTableProps {
  onEdit: (categoria: CategoriaResponse) => void;
  onCreate: () => void;
}

export const CategoriasTable: React.FC<CategoriasTableProps> = ({ onEdit, onCreate }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const {
    categorias,
    loading,
    error,
    filters,
    pagination,
    totalCount,
  } = useAppSelector((state) => state.categorias);

  const [localFilters, setLocalFilters] = useState(filters);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: pagination.skip / pagination.limit,
    pageSize: pagination.limit,
  });

  // Load data on component mount and when filters/pagination change
  useEffect(() => {
    dispatch(fetchCategorias({
      ...filters,
      skip: pagination.skip,
      limit: pagination.limit,
    }));
  }, [dispatch, filters, pagination]);

  // Handle filter changes
  const handleFilterChange = (field: string, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Apply filters
  const handleApplyFilters = () => {
    dispatch(setFilters(localFilters));
    // Reset to first page when applying filters
    dispatch(setPagination({ skip: 0, limit: pagination.limit }));
  };

  // Clear filters
  const handleClearFilters = () => {
    setLocalFilters({});
    dispatch(setFilters({}));
    // Reset to first page when clearing filters
    dispatch(setPagination({ skip: 0, limit: pagination.limit }));
  };

  // Handle delete
  const handleDelete = (id: number) => {
    if (window.confirm(t('messages.confirm_delete'))) {
      dispatch(deleteCategoria(id));
    }
  };

  // Columns definition
  const columns: GridColDef[] = [
    {
      field: 'NomCategoria',
      headerName: t('categorias.nome'),
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'Descricao',
      headerName: t('categorias.descricao'),
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'TipoCategoria',
      headerName: t('categorias.tipo'),
      width: 120,
      renderCell: (params) => {
        let label = '';
        let color: 'success' | 'error' | 'info' = 'info';
        
        switch (params.value) {
          case 'R':
            label = t('categorias.receita');
            color = 'success';
            break;
          case 'D':
            label = t('categorias.despesa');
            color = 'error';
            break;
          case 'T':
            label = t('categorias.transferencia');
            color = 'info';
            break;
        }
        
        return (
          <Chip
            label={label}
            color={color}
            size="small"
          />
        );
      },
    },
    {
      field: 'categoria_pai_nome',
      headerName: t('categorias.categoria_pai'),
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'FlgAtivo',
      headerName: t('categorias.ativo'),
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value === 'S' ? t('categorias.ativo') : t('categorias.inativo')}
          color={params.value === 'S' ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: t('actions.actions'),
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={t('actions.edit')}>
            <IconButton
              size="small"
              onClick={() => onEdit(params.row as CategoriaResponse)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('actions.delete')}>
            <IconButton
              size="small"
              onClick={() => handleDelete(params.row.CodCategoria)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      {/* Filter controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label={t('categorias.nome')}
          value={localFilters.tipo || ''}
          onChange={(e) => handleFilterChange('tipo', e.target.value || undefined)}
          size="small"
        />
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>{t('categorias.tipo')}</InputLabel>
          <Select
            value={localFilters.tipo || ''}
            label={t('categorias.tipo')}
            onChange={(e) => handleFilterChange('tipo', e.target.value || undefined)}
          >
            <MenuItem value="R">{t('categorias.receita')}</MenuItem>
            <MenuItem value="D">{t('categorias.despesa')}</MenuItem>
            <MenuItem value="T">{t('categorias.transferencia')}</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>{t('categorias.ativo')}</InputLabel>
          <Select
            value={localFilters.ativas_apenas !== undefined ? (localFilters.ativas_apenas ? '1' : '0') : '1'}
            label={t('categorias.ativo')}
            onChange={(e) => handleFilterChange('ativas_apenas', e.target.value === '1' ? true : (e.target.value === '0' ? false : undefined))}
          >
            <MenuItem value="1">{t('categorias.ativo')}</MenuItem>
            <MenuItem value="0">{t('categorias.inativo')}</MenuItem>
          </Select>
        </FormControl>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            variant="contained"
            onClick={handleApplyFilters}
            size="small"
          >
            {t('actions.filter')}
          </Button>
          <Button
            variant="outlined"
            onClick={handleClearFilters}
            size="small"
          >
            {t('actions.clear')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreate}
            size="small"
          >
            {t('categorias.nova')}
          </Button>
        </Box>
      </Box>

      {/* Data Grid */}
      <DataGrid
        rows={categorias}
        columns={columns}
        loading={loading}
        rowCount={totalCount}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        pageSizeOptions={[10, 20, 50]}
        paginationMode="server"
        filterMode="server"
        sortingMode="server"
        disableRowSelectionOnClick
        getRowId={(row) => row.CodCategoria}
        sx={{
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
        }}
      />
      
      {error && (
        <Box sx={{ mt: 2, color: 'error.main' }}>
          {error}
        </Box>
      )}
    </Box>
  );
};
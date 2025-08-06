'use client'

import * as React from 'react';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import { visuallyHidden } from '@mui/utils';
import { Avatar, Chip, Button } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

interface StockData {
  id: number;
  symbol: string;
  sector: string;
  price: number;
  change: number;
  volume: number;
  exDate: string;
  dividend: number;
}

function createStockData(
  id: number,
  symbol: string,
  sector: string,
  price: number,
  change: number,
  volume: number,
  exDate: string,
  dividend: number,
): StockData {
  return {
    id,
    symbol,
    sector,
    price,
    change,
    volume,
    exDate,
    dividend,
  };
}

const rows = [
  createStockData(1, 'PTT', 'ENERG', 28.25, 4.2, 2, '6 ม.ค. 2568', 1.30),
  createStockData(2, 'SCB', 'BANK', 124.00, 8.52, 2, '16 เม.ย. 2568', 8.40),
  createStockData(3, 'CPALL', 'COMM', 50.50, 2.67, 1, '6 พ.ค. 2568', 1.35),
  createStockData(4, 'AOT', 'TRANS', 38.75, 2.04, 1, '4 ธ.ค. 2568', 0.79),
  createStockData(5, 'CPN', 'PROP', 51.25, 4.10, 1, '17 มี.ค. 2568', 2.10),
  createStockData(6, 'KTB', 'BANK', 22.50, 6.87, 1, '16 เม.ย. 2568', 1.545),
];

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof StockData;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'symbol',
    numeric: false,
    disablePadding: true,
    label: 'สัญลักษณ์',
  },
  {
    id: 'sector',
    numeric: false,
    disablePadding: false,
    label: 'กลุ่ม',
  },
  {
    id: 'price',
    numeric: true,
    disablePadding: false,
    label: 'ราคาปิดวันปัจจุบัน(บาท)',
  },
  {
    id: 'change',
    numeric: true,
    disablePadding: false,
    label: 'ผลตอบแทนเงินปันผล(%)',
  },
  {
    id: 'volume',
    numeric: true,
    disablePadding: false,
    label: 'ปันผล(ครั้ง/ปี)',
  },
  {
    id: 'exDate',
    numeric: false,
    disablePadding: false,
    label: 'วันที่มีสิทธิรับ XD',
  },
  {
    id: 'dividend',
    numeric: true,
    disablePadding: false,
    label: 'เงินปันผล(บาท/หุ้น)',
  },
];

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof StockData) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
    props;
  const createSortHandler =
    (property: keyof StockData) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all stocks',
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{
              fontWeight: 600,
              color: '#374151',
              backgroundColor: '#f8fafc',
            }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell
          align="center"
          sx={{
            fontWeight: 600,
            color: '#374151',
            backgroundColor: '#f8fafc',
          }}
        >
          การกำหนดเงิน
        </TableCell>
      </TableRow>
    </TableHead>
  );
}

interface EnhancedTableToolbarProps {
  numSelected: number;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { numSelected } = props;

  return (
    <Toolbar
      sx={[
        {
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          minHeight: '64px',
        },
        numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        },
      ]}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
        <Avatar
          sx={{
            backgroundColor: '#60a5fa',
            width: 40,
            height: 40,
          }}
        >
          📊
        </Avatar>
        {numSelected > 0 ? (
          <Typography
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {numSelected} รายการที่เลือก
          </Typography>
        ) : (
          <Typography
            variant="h6"
            id="tableTitle"
            component="div"
            sx={{ fontWeight: 'bold', color: 'text.primary' }}
          >
            หุ้นที่แนะนำสำหรับ
          </Typography>
        )}
      </Box>
      
      {numSelected > 0 ? (
        <Tooltip title="ลบ">
          <IconButton>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="กรองข้อมูล">
          <IconButton>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}

export default function StockTable() {
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof StockData>('symbol');
  const [selected, setSelected] = React.useState<readonly number[]>([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof StockData,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDense(event.target.checked);
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const visibleRows = React.useMemo(
    () =>
      [...rows]
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage],
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Paper 
        sx={{ 
          width: '100%', 
          mb: 2,
          borderRadius: 2,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        }}
      >
        <EnhancedTableToolbar numSelected={selected.length} />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const isItemSelected = selected.includes(row.id);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, row.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#f8fafc',
                      },
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{
                          'aria-labelledby': labelId,
                        }}
                      />
                    </TableCell>
                    
                    {/* Symbol */}
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="none"
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            backgroundColor: '#60a5fa',
                            fontSize: '0.75rem'
                          }}
                        >
                          {row.symbol.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" fontWeight="bold">
                          {row.symbol}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    {/* Sector */}
                    <TableCell>
                      <Chip
                        label={row.sector}
                        size="small"
                        sx={{
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          fontSize: '0.75rem',
                        }}
                      />
                    </TableCell>
                    
                    {/* Price */}
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {row.price.toFixed(2)}
                      </Typography>
                    </TableCell>
                    
                    {/* Change */}
                    <TableCell align="right">
                      <Box
                        sx={{
                          color: row.change > 0 ? '#16a34a' : '#dc2626',
                          fontWeight: 'medium',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: 0.5,
                        }}
                      >
                        {row.change > 0 && <TrendingUp sx={{ fontSize: 16 }} />}
                        {row.change.toFixed(2)}%
                      </Box>
                    </TableCell>
                    
                    {/* Volume */}
                    <TableCell align="right">{row.volume}</TableCell>
                    
                    {/* Ex Date */}
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {row.exDate}
                      </Typography>
                    </TableCell>
                    
                    {/* Dividend */}
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium" color="primary">
                        ฿{row.dividend.toFixed(2)}
                      </Typography>
                    </TableCell>
                    
                    {/* Actions */}
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="contained"
                        sx={{
                          backgroundColor: '#60a5fa',
                          fontSize: '0.75rem',
                          py: 0.5,
                          px: 1,
                          '&:hover': {
                            backgroundColor: '#3b82f6',
                          },
                        }}
                        onClick={(e) => {
                          e.stopPropagation(); // ป้องกันไม่ให้ trigger row selection
                          console.log('Buy/Sell clicked for', row.symbol);
                        }}
                      >
                        ซื้อ/ขาย
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (dense ? 33 : 53) * emptyRows,
                  }}
                >
                  <TableCell colSpan={8} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="แถวต่อหน้า:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`
          }
        />
      </Paper>
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="แสดงแบบกระชับ"
      />
    </Box>
  );
}
import { 
  TableHead, TableRow, TableCell, TableSortLabel, Box 
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';

interface HeadCell {
  id: string;
  label: string;
  numeric: boolean;
  width?: string;
  align?: 'left' | 'right' | 'center';
}

export const DEFAULT_HEAD_CELLS: HeadCell[] = [
  { id: 'symbol', numeric: false, label: 'สัญลักษณ์', width: '120px', align: 'left' },
  { id: 'stockSector', numeric: false, label: 'กลุ่ม', width: '100px', align: 'left' },
  { id: 'clusterName', numeric: false, label: 'Cluster', width: '180px', align: 'left' },
  { id: 'latestPrice', numeric: true, label: 'ราคา', width: '90px', align: 'right' },
  { id: 'totalScore', numeric: true, label: 'Score', width: '90px', align: 'right' },
  { id: 'dyPercent', numeric: true, label: 'Yield(%)', width: '100px', align: 'right' },
  { id: 'dividendExDate', numeric: false, label: 'วันที่ XD', width: '120px', align: 'right' }, // วันที่สากลนิยมชิดขวาเพื่อให้ตรงกับตัวเลขปันผล
  { id: 'dividendDps', numeric: true, label: 'ปันผล(บาท)', width: '100px', align: 'right' },
  { id: 'predictExDate', numeric: false, label: 'คาดการณ์ XD', width: '120px', align: 'right' },
  { id: 'predictDps', numeric: true, label: 'คาดการณ์ปันผล', width: '110px', align: 'right' },
  { id: 'retBfTema', numeric: true, label: 'Ret Before(%)', width: '110px', align: 'right' },
  { id: 'retAfTema', numeric: true, label: 'Ret After(%)', width: '110px', align: 'right' },
];

interface EnhancedTableHeadProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
  order: 'asc' | 'desc';
  orderBy: string;
  rowCount: number;
  customHeadCells?: HeadCell[];
}

export function EnhancedTableHead(props: EnhancedTableHeadProps) {
  const { order, orderBy, onRequestSort } = props;

  const createSortHandler = (property: string) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  const headCells = props.customHeadCells || DEFAULT_HEAD_CELLS;

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || (headCell.numeric ? 'right' : 'left')} // ใช้ค่าที่ส่งมา หรือ default ตามประเภท
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ 
                width: headCell.width,
                whiteSpace: 'nowrap',
                fontWeight: 'bold',
                backgroundColor: '#cee1ff' 
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
      </TableRow>
    </TableHead>
  );
}
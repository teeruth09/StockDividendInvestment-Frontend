import React, { useState } from 'react';
import {
  Box, TextField, FormControl, InputLabel, Select, MenuItem,
  Button, Grid, Paper, Typography, Collapse, IconButton, Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  RotateLeft as ResetIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { ClusterType, StockSector } from '@/types/enum';

interface StockFilterToolbarProps {
  search: string;
  setSearch: (value: string) => void;
  sector: string;
  setSector: (value: string) => void;
  cluster: string;
  setCluster: (value: string) => void;
  minDy: number | "";
  setMinDy: (value: number | "") => void;
  minScore: number | "";
  setMinScore: (value: number | "") => void;
  month: number | "";
  setMonth: (value: number | "") => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

export default function StockFilterToolbar({
  search, setSearch, sector, setSector, cluster, setCluster, 
  minDy, setMinDy, minScore, setMinScore, month, setMonth,
  startDate, setStartDate, endDate, setEndDate,
  onSearch, onClear
}: StockFilterToolbarProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Paper sx={{ mb: 2, borderRadius: 2, overflow: 'hidden', border: '1px solid #e0e0e0' }} elevation={0}>
      <Box 
        sx={{ 
          p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          bgcolor: '#fcfcfc', borderBottom: expanded ? '1px solid #eee' : 'none',
          cursor: 'pointer'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <FilterIcon sx={{ fontSize: 20, color: '#666' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#444' }}>
            ค้นหา
          </Typography>
        </Stack>
        <IconButton size="small" sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}>
          <ExpandMoreIcon />
        </IconButton>
      </Box>

      {/* เนื้อหาแผงค้นหา */}
      <Collapse in={expanded}>
        <Box sx={{ p: 3, bgcolor: '#fff' }}>
          <Grid container spacing={2}>
            {/* ชื่อหุ้น */}
            <Grid size={{ xs:12, sm:4 }}>
              <TextField
                fullWidth
                label="สัญลักษณ์หุ้น"
                variant="outlined"
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="เช่น PTT, ADVANC"
              />
            </Grid>
            {/* กลุ่มธุรกิจ */}
            <Grid size={{ xs:12, sm:4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>กลุ่มธุรกิจ</InputLabel>
                <Select
                  value={sector}
                  label="กลุ่มธุรกิจ"
                  onChange={(e) => setSector(e.target.value as string)}
                >
                  <MenuItem value=""><em>ทั้งหมด</em></MenuItem>
                  {Object.entries(StockSector).map(([key, label]) => (
                    <MenuItem key={key} value={key}>
                    {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* ดรอปดาวน์ Cluster */}
            <Grid size={{ xs:12, sm:4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>กลุ่ม Cluster</InputLabel>
                <Select
                  value={cluster}
                  label="สถานะ/กลุ่ม Cluster"
                  onChange={(e) => setCluster(e.target.value as string)}
                >
                  <MenuItem value=""><em>ทั้งหมด</em></MenuItem>
                  {Object.entries(ClusterType).map(([key, label]) => (
                    <MenuItem key={key} value={key}>
                    {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Yield ขั้นต่ำ */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Yield ขั้นต่ำ (%)"
                type="number"
                size="small"
                value={minDy}
                onChange={(e) => setMinDy(e.target.value === "" ? "" : Number(e.target.value))}
                slotProps={{ htmlInput: { min: 0, step: "0.1" } }}
              />
            </Grid>

            {/* Score ขั้นต่ำ */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Score ขั้นต่ำ"
                type="number"
                size="small"
                value={minScore}
                onChange={(e) => setMinScore(e.target.value === "" ? "" : Number(e.target.value))}
                slotProps={{ htmlInput: { min: 0 } }}
              />
            </Grid>

            {/* เลือกเดือน */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>เดือนที่จ่ายปันผล</InputLabel>
                <Select
                  value={month}
                  label="เดือนที่จ่ายปันผล"
                  onChange={(e) => {
                    const val = e.target.value;
                    setMonth(val === 0 ? "" : Number(val));
                  }}
                >
                  <MenuItem value={0}><em>ทั้งหมด</em></MenuItem>
                  {[
                    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
                    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
                  ].map((name, index) => (
                  <MenuItem key={index + 1} value={index + 1}>{name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* ช่วงวันที่ (Date Range) */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="วันที่ XD (เริ่มต้น)"
                type="date"
                size="small"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="วันที่ XD (สิ้นสุด)"
                type="date"
                size="small"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>

            {/* ปุ่มดำเนินการ */}         
            <Grid size={{ xs:12 }} sx={{ mt: 1 }}>   
              <Stack direction="row" spacing={1.5}>
                <Button 
                  variant="contained" 
                  startIcon={<SearchIcon />}
                  onClick={onSearch}
                  sx={{ 
                    bgcolor: '#3c82f6',
                    '&:hover': { bgcolor: '#1976d2' },
                    px: 3, borderRadius: 1.5, textTransform: 'none'
                  }}
                >
                  ค้นหา
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<ResetIcon />}
                  onClick={onClear}
                  sx={{ 
                    color: '#3c82f6', borderColor: '#1976d2',
                    '&:hover': { borderColor: '#3c82f6', bgcolor: 'rgba(243, 129, 60, 0.04)' },
                    px: 3, borderRadius: 1.5, textTransform: 'none'
                  }}
                >
                  เคลียร์
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  );
}
import StockTable from "@/components/stock/StockTable";

export default function StockPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1, padding: '20px' }}>
        <StockTable/>
      </main>
    </div>
  );
}
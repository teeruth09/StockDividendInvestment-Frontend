import StockDataGrid from "./home/home";

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* header / navbar etc. */}
      <main style={{ flex: 1, padding: '20px' }}>
        <StockDataGrid />
      </main>
    </div>
  );
}
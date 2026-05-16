export default function LoadingSpinner({ fullPage = false }) {
  if (fullPage) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <div className="spinner" />
    </div>
  );
}

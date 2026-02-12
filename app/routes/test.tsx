// Completely bare test page - no MUI, no contexts, just plain HTML
export default function TestPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Hydration Test Page</h1>
      <p>This is a minimal test page with zero dependencies.</p>
      <p>If you see this without hydration errors, the issue is in MUI or contexts.</p>
    </div>
  );
}

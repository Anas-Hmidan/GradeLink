export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>GradeLink API Server</h1>
      <p>Backend server is running. API endpoints available at /api/*</p>
      <ul>
        <li><a href="/api/auth/login">/api/auth/login</a></li>
        <li><a href="/api/auth/register">/api/auth/register</a></li>
        <li><a href="/api/test/generate">/api/test/generate</a></li>
      </ul>
    </div>
  );
}

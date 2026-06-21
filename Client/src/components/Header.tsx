export default function Header() {
  return (
    <header className="header">
      <img
        className="logo"
        src="/logo.png"
        alt="Argus Logo"
        width={90}
        height={90}
      />
      <h1 className="title font-bungee">ARGUS SCANNER</h1>
      <p className="subtitle">
        Gizli reklamları ve şüpheli yönlendirmeleri saniyeler içinde tespit
        edin.
      </p>
    </header>
  );
}

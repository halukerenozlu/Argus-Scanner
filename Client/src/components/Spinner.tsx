export default function Spinner() {
  return (
    <svg className="spinner" viewBox="0 0 50 50" fill="none" aria-hidden="true">
      <circle cx="25" cy="25" r="18" className="spinnerTrack" />
      <path d="M43 25c0-9.94-8.06-18-18-18" className="spinnerHead">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 25 25"
          to="360 25 25"
          dur="0.8s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}

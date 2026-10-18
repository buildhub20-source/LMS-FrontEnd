/**
 * The GradusMind "GM" mark. Strokes use the current text colour so the mark
 * works on light and dark surfaces; the dot keeps the brand gold.
 */
export const GradusMindLogo = ({ size = 24, title = 'GradusMind', className, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 2 64 52"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label={title}
    className={className}
    style={style}
  >
    <g
      transform="translate(3.5 0)"
      stroke="currentColor"
      strokeWidth="7.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M28.9 22.1 A14 14 0 1 0 33 32 H25.5" />
      <path d="M33 46 V18 L42.5 33 L52 18 V46" />
    </g>
    <circle cx="55.5" cy="10.5" r="5.2" fill="#c9973b" />
  </svg>
);

export default GradusMindLogo;

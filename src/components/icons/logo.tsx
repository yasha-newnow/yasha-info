interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 40, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M28 0C43.464 0 56 12.536 56 28C56 43.464 43.464 56 28 56C12.536 56 0 43.464 0 28C0 12.536 12.536 0 28 0ZM14.977 40.656L20.376 43.773L25.068 41.065L19.669 37.947L14.977 40.656ZM26.148 15.747V40.445L32.238 36.93V12.231L26.148 15.747ZM13.339 16.352L15.771 17.759V26.568L21.985 30.156V15.747L18.19 13.552L13.339 16.352ZM34.016 16.352L36.447 17.759V30.156L42.662 26.568V15.747L38.867 13.552L34.016 16.352Z"
        fill="currentColor"
      />
    </svg>
  );
}

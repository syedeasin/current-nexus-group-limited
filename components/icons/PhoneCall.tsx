interface PhoneCallProps {
  size?: number;
  className?: string;
}

/**
 * Figma's "Call" icon (node I4030:4964;4020:7633) is 3 separate exported
 * vector fragments layered in an 18x18 box — the handset plus two signal
 * arcs. Reproduced here as one inline SVG with each fragment's real path
 * data translated to its designed position, rather than 3 image requests.
 */
export function PhoneCall({ size = 18, className }: PhoneCallProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 18 18"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M9.874 11.926C10.0289 11.9971 10.2034 12.0134 10.3688 11.9721C10.5341 11.9308 10.6805 11.8344 10.7837 11.6987L11.05 11.35C11.1897 11.1637 11.3709 11.0125 11.5792 10.9084C11.7875 10.8042 12.0171 10.75 12.25 10.75H14.5C14.8978 10.75 15.2794 10.908 15.5607 11.1893C15.842 11.4706 16 11.8522 16 12.25V14.5C16 14.8978 15.842 15.2794 15.5607 15.5607C15.2794 15.842 14.8978 16 14.5 16C10.9196 16 7.4858 14.5777 4.95406 12.0459C2.42232 9.5142 1 6.08042 1 2.5C1 2.10218 1.15804 1.72064 1.43934 1.43934C1.72064 1.15804 2.10218 1 2.5 1H4.75C5.14782 1 5.52935 1.15804 5.81066 1.43934C6.09196 1.72064 6.25 2.10218 6.25 2.5V4.75C6.25 4.98287 6.19578 5.21254 6.09164 5.42082C5.9875 5.6291 5.83629 5.81028 5.65 5.95L5.299 6.21325C5.16131 6.31838 5.06426 6.46794 5.02434 6.63651C4.98442 6.80509 5.00409 6.98228 5.08 7.138C6.10501 9.2199 7.79082 10.9036 9.874 11.926Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(0.5, 0.5)"
      />
      <path
        d="M1 1C2.79021 1 4.5071 1.71116 5.77297 2.97703C7.03884 4.2429 7.75 5.95979 7.75 7.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(9.75, 1.5)"
      />
      <path
        d="M1 1C1.99456 1 2.94839 1.39509 3.65165 2.09835C4.35491 2.80161 4.75 3.75544 4.75 4.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(7.75, 4.5)"
      />
    </svg>
  );
}

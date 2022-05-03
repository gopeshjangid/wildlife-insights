// Customize your breakpoints here
export const BREAKPOINTS = {
  small: 0, // 48rem
  medium: 768, // 64rem
  large: 992 // 80rem
};

export const SIZES = {
  phone: BREAKPOINTS.medium - 10,
  tablet: BREAKPOINTS.large - 10,
  desktop: BREAKPOINTS.large + 10
};

export default { BREAKPOINTS, SIZES };

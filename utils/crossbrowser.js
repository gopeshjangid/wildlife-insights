export const isIE = () => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const ie = (ua.indexOf('MSIE ') > 0) || (ua.indexOf('Trident/') > 0) || (ua.indexOf('Edge/') > 0);

  return ie;
};

export default { isIE };

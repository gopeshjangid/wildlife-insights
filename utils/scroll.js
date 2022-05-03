export const HEADER_HEIGHT = 130;

const easeOutCubic = (t, v0, delta, d) => {
  const x = t / d - 1;
  return delta * (x ** 3 + 1) + v0;
};

/**
 * Smoothly scroll to a specific position
 * @param {number} duration Duration of the animation in milliseconds
 * @param {number} startPosition Initial position of the scroll
 * @param {number} endPosition End position of the scroll
 * @param {number} [elapsed] Elapsed time since the beginning of the animation
 */
export const smoothScroll = (
  duration,
  startPosition,
  endPosition,
  elapsed = 0,
) => {
  if (elapsed < duration) {
    const time = +new Date();
    window.scrollTo(
      0,
      easeOutCubic(
        elapsed,
        startPosition,
        endPosition - startPosition,
        duration,
      ),
    );
    requestAnimationFrame(() => {
      smoothScroll(
        duration,
        startPosition,
        endPosition,
        elapsed + (+new Date() - time),
      );
    });
  }
};

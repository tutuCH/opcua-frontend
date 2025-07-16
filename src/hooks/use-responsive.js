import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// ----------------------------------------------------------------------

export function useResponsive(query, start, end) {
  const theme = useTheme();

  const mediaUp = useMediaQuery(theme.breakpoints.up(start));

  const mediaDown = useMediaQuery(theme.breakpoints.down(start));

  const mediaBetween = useMediaQuery(theme.breakpoints.between(start, end));

  const mediaOnly = useMediaQuery(theme.breakpoints.only(start));

  if (query === 'up') {
    return mediaUp;
  }

  if (query === 'down') {
    return mediaDown;
  }

  if (query === 'between') {
    return mediaBetween;
  }

  return mediaOnly;
}

// ----------------------------------------------------------------------

export function useWidth() {
  const theme = useTheme();
  const keys = [...theme.breakpoints.keys].reverse();
  
  // Create all media queries outside the reducer to follow React hooks rules
  const mediaQueries = keys.map(key => ({
    key,
    matches: useMediaQuery(theme.breakpoints.up(key))
  }));
  
  // Find the first matching breakpoint
  const matchingBreakpoint = mediaQueries.find(({ matches }) => matches);
  return matchingBreakpoint ? matchingBreakpoint.key : 'xs';
}

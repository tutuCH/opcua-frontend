import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// ----------------------------------------------------------------------

type ResponsiveQuery = 'up' | 'down' | 'between' | 'only';
type BreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export function useResponsive(query: ResponsiveQuery, start: BreakpointKey, end?: BreakpointKey): boolean {
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

export function useWidth(): BreakpointKey {
  const theme = useTheme();
  const keys = [...theme.breakpoints.keys].reverse() as BreakpointKey[];
  
  // Create all media queries outside the reducer to follow React hooks rules
  const mediaQueries = keys.map((key: BreakpointKey) => ({
    key,
    matches: useMediaQuery(theme.breakpoints.up(key))
  }));
  
  // Find the first matching breakpoint
  const matchingBreakpoint = mediaQueries.find(({ matches }) => matches);
  return matchingBreakpoint ? matchingBreakpoint.key : 'xs';
}

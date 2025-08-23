import React, { useEffect, useMemo } from "react";
import PropTypes from "prop-types";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import { alpha } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import ListItemButton from "@mui/material/ListItemButton";

import { usePathname } from "src/routes/hooks";
import { RouterLink } from "src/routes/components";
import { useResponsive } from "src/hooks/use-responsive";
import Scrollbar from "src/components/scrollbar";

import { NAV } from "./config-layout";
import navConfig from "./config-navigation";
import { BottomNav } from "./bottom-nav";

export default function Nav({ openNav, onCloseNav }) {
  const pathname = usePathname();
  const upLg = useResponsive("up", "lg");

  const account = {
    displayName: localStorage.getItem("username"),
    email: localStorage.getItem("email"),
    photoURL: "/assets/images/avatars/avatar_25.jpg",
  };

  // Close mobile nav when route changes
  useEffect(() => {
    if (openNav) onCloseNav();
  }, [pathname, openNav, onCloseNav]);

  const content = useMemo(
    () => (
      <Scrollbar
        sx={{
          height: 1,
          "& .simplebar-content": {
            height: 1,
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <Box
          sx={{
            my: 3,
            mx: 2.5,
            py: 2,
            px: 2.5,
            display: "flex",
            alignItems: "center",
            borderRadius: 1.5,
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
          }}
        >
          <Avatar src={account.photoURL} alt="photoURL" />
          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle2">{account.displayName}</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {account.role}
            </Typography>
          </Box>
        </Box>
        <Stack component="nav" spacing={0.5} sx={{ px: 2 }}>
          {navConfig.map((item) => (
            <NavItem key={item.title} item={item} />
          ))}
        </Stack>
        <Box sx={{ flexGrow: 1 }} />
      </Scrollbar>
    ),
    [account, pathname]
  );

  return (
    <Box sx={{ flexShrink: { lg: 0 }, width: { lg: NAV.WIDTH } }}>
      {upLg ? (
        <Box
          sx={{
            height: 1,
            position: "fixed",
            width: NAV.WIDTH,
            borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          }}
        >
          {content}
        </Box>
      ) : (
        <BottomNav />
      )}
    </Box>
  );
}

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};

const NavItem = React.memo(({ item }) => {
  const pathname = usePathname();
  const active = pathname.includes(item.path);

  return (
    <ListItemButton
      component={RouterLink}
      href={item.path}
      sx={{
        minHeight: 44,
        borderRadius: 0.75,
        typography: "body2",
        textTransform: "capitalize",
        fontWeight: "fontWeightMedium",
        color: "text.secondary",
        ...(active && {
          color: "primary.main",
          fontWeight: "fontWeightSemiBold",
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          "&:hover": {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
          },
        }),
      }}
    >
      <Box component="span" sx={{ width: 24, height: 24, mr: 2 }}>
        {item.icon}
      </Box>
      <Box component="span">{item.title}</Box>
    </ListItemButton>
  );
});

NavItem.propTypes = {
  item: PropTypes.object.isRequired,
};

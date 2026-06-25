import React, { useEffect } from 'react';
import Menuitems, { mapMenuIcons } from './MenuItems';
import { usePathname } from "next/navigation";
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useDispatch, useSelector } from '@/store/hooks';
import NavItem from './NavItem';
import NavCollapse from './NavCollapse';
import NavGroup from './NavGroup/NavGroup';
import { AppState } from '@/store/store';
import { toggleMobileSidebar } from '@/store/customizer/CustomizerSlice';
import { setMenuItems } from '@/store/apps/menu/menuSlice';

const SidebarItems = () => {
  const pathname = usePathname();
  const pathDirect = pathname;
  const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf('/'));
  const customizer = useSelector((state: AppState) => state.customizer);
  const menuItemsState = useSelector((state: AppState) => state.menuReducer.items);
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
  const hideMenu: any = lgUp ? customizer.isCollapse && !customizer.isSidebarHover : '';
  const dispatch = useDispatch();

  const [userRole, setUserRole] = React.useState<string | null>(null);
  const isAdmin = userRole === 'admin';

  // Check role on mount
  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data.success && data.user && data.user.role) {
          setUserRole(data.user.role);
        }
      } catch (err) {
        console.error('Error checking user role in sidebar:', err);
      }
    };
    checkRole();
  }, []);

  // Load custom menu config on mount
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch('/api/menu-config');
        const data = await res.json();
        if (data.success && data.menu && data.menu.length > 0) {
          const mapped = mapMenuIcons(data.menu);
          dispatch(setMenuItems(mapped));
        } else {
          // If no custom menu exists on server, load the default menu items
          dispatch(setMenuItems(Menuitems));
        }
      } catch (error) {
        console.error('Failed to load menu config:', error);
        dispatch(setMenuItems(Menuitems));
      }
    };
    fetchMenu();
  }, [dispatch]);

  // Fallback to static Menuitems if Redux store is not populated yet
  const displayItems = menuItemsState.length > 0 ? menuItemsState : Menuitems;

  // Filter out items that are marked as hidden (show === false)
  // And filter based on allowedRoles or legacy isAdminOnly
  const visibleItems = displayItems.filter(item => {
    if (item.show === false) return false;
    if (item.isAdminOnly && !isAdmin) return false;
    if (item.allowedRoles && item.allowedRoles.length > 0) {
      if (!userRole || !item.allowedRoles.includes(userRole)) return false;
    }
    return true;
  });

  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav">
        {visibleItems.map((item) => {
          // {/********SubHeader**********/}
          if (item.subheader) {
            return <NavGroup item={item} hideMenu={hideMenu} key={item.subheader} />;

            // {/********If Sub Menu**********/}
            /* eslint no-else-return: "off" */
          } else if (item.children && item.children.length > 0) {
            // Filter children that are visible and allowed
            const visibleChildren = item.children.filter((child: any) => {
              if (child.show === false) return false;
              if (child.isAdminOnly && !isAdmin) return false;
              if (child.allowedRoles && child.allowedRoles.length > 0) {
                if (!userRole || !child.allowedRoles.includes(userRole)) return false;
              }
              return true;
            });
            if (visibleChildren.length === 0) {
              return (
                <NavItem item={item} key={item.id} pathDirect={pathDirect} hideMenu={hideMenu} onClick={() => dispatch(toggleMobileSidebar())} />
              );
            }
            const itemWithVisibleChildren = { ...item, children: visibleChildren };

            return (
              <NavCollapse
                menu={itemWithVisibleChildren}
                pathDirect={pathDirect}
                hideMenu={hideMenu}
                pathWithoutLastPart={pathWithoutLastPart}
                level={1}
                key={item.id}
                onClick={() => dispatch(toggleMobileSidebar())}
              />
            );

            // {/********If Sub No Menu**********/}
          } else {
            return (
              <NavItem item={item} key={item.id} pathDirect={pathDirect} hideMenu={hideMenu} onClick={() => dispatch(toggleMobileSidebar())} />
            );
          }
        })}
      </List>
    </Box>
  );
};
export default SidebarItems;

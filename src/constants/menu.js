const data = [
  {
    id: 'dashboard',
    icon: 'simple-icon-speedometer',
    label: 'menu.dashboard',
    to: '/app/dashboard',
  },
  {
    id: 'usermenu',
    icon: 'simple-icon-people',
    label: 'menu.users',
    to: '/app/user',
  },
  {
    id: 'postmenu',
    icon: 'simple-icon-paper-plane',
    label: 'menu.posts',
    to: '/app/post',
  },
  {
    id: 'languages',
    icon: 'simple-icon-globe',
    label: 'menu.languages',
    to: '/app/lang',
  },
  {
    id: 'settings',
    icon: 'simple-icon-settings',
    label: 'menu.settings',
    to: '/app/settings',
    subs: [
      {
        icon: 'iconsminds-gears',
        label: 'menu.config',
        to: '/app/settings/config',
      },
      {
        icon: 'iconsminds-profile',
        label: 'menu.profile',
        to: '/app/settings/profile',
      },
      {
        icon: 'iconsminds-key-lock',
        label: 'menu.password',
        to: '/app/settings/password',
      },
    ],
  },
];
export default data;

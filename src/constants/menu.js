const data = [
  {
    id: 'dashboard',
    icon: 'iconsminds-dashboard',
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
  // {
  //   id: 'blankpage',
  //   icon: 'iconsminds-bucket',
  //   label: 'menu.blank-page',
  //   to: '/app/blank-page',
  // },
  // {
  //   id: 'docs',
  //   icon: 'iconsminds-library',
  //   label: 'menu.docs',
  //   to: 'https://gogo-react-docs.coloredstrategies.com/',
  //   newWindow: true,
  // },
];
export default data;

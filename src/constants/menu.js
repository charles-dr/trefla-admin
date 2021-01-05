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
    subs: [
      {
        id: 'users-ID',
        label: 'menu.users-ID',
        to: '/app/user',
        subs: [
          {
            icon: 'simple-icon-list',
            label: 'menu.list',
            to: '/app/user/list',
          },
          {
            icon: 'iconsminds-id-card',
            label: 'menu.national-ids',
            to: '/app/user/national-ids',
          },
          // {
          //   icon: 'iconsminds-quill-3',
          //   label: 'menu.id-changes',
          //   to: '/app/user/id-changes',
          // },
          {
            icon: 'iconsminds-shield',
            label: 'menu.id-transfer',
            to: '/app/user/id-transfer',
          }
        ],
      },{
        id: 'notification',
        label: 'menu.notification',
        to: '/app/notification',
        subs: [
          {
            icon: 'simple-icon-bell',
            label: 'menu.send-notification',
            to: '/app/notification/send',
          },
        ]
      }
    ],
  },
  {
    id: 'postmenu',
    icon: 'simple-icon-paper-plane',
    label: 'menu.posts',
    to: '/app/post',
  },
  {
    id: 'commentmenu',
    icon: 'simple-icon-bubbles',
    label: 'menu.comments',
    to: '/app/comment',
  },
  {
    id: 'reportmenu',
    icon: 'simple-icon-shield',
    label: 'menu.reports',
    to: '/app/report',
  },
  {
    id: 'bugmenu',
    icon: 'iconsminds-security-bug',
    label: 'menu.bugs',
    to: '/app/bug',
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
      // {
      //   icon: 'iconsminds-data-center',
      //   label: 'menu.db-backups',
      //   to: '/app/settings/db-backups',
      // },
      {
        icon: 'iconsminds-inbox-full',
        label: 'menu.email-templates',
        to: '/app/settings/email-templates',
      },
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

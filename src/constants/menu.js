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
            permission: 'user.list.show',
          },
        ],
      },
      {
        id: 'driver-ids',
        label: 'menu.driver-id',
        to: '/app/driver-ids',
        subs: [
          {
            icon: 'iconsminds-id-card',
            label: 'menu.driver-id-list',
            to: '/app/user/driver-ids',
            permission: 'user.nationalId.show'
          },
          {
            icon: 'iconsminds-left---right',
            label: 'menu.id-transfer',
            to: '/app/user/driver-id-transfer',
            permission: 'user.idTransfer.show'
          }
        ],
      },
      {
        id: 'national-ids',
        label: 'menu.national-id',
        to: '/app/national-ids',
        subs: [
          {
            icon: 'iconsminds-id-card',
            label: 'menu.national-id-list',
            to: '/app/user/national-ids',
            permission: 'user.nationalId.show'
          },
        ],
      },
      {
        id: 'notification',
        label: 'menu.notification',
        to: '/app/notification',
        permission: 'user.sendNotification.show',
        subs: [
          {
            icon: 'simple-icon-bell',
            label: 'menu.send-notification',
            to: '/app/notification/send',
            permission: 'user.sendNotification.show',
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
    permission: 'post.show',
  },
  {
    id: 'commentmenu',
    icon: 'simple-icon-bubbles',
    label: 'menu.comments',
    to: '/app/comment',
    permission: 'comment.show',
  },
  {
    id: 'reportmenu',
    icon: 'simple-icon-shield',
    label: 'menu.reports',
    to: '/app/report',
    permission: 'report.show',
  },
  {
    id: 'bugmenu',
    icon: 'iconsminds-security-bug',
    label: 'menu.bugs',
    to: '/app/bug',
    permission: 'bug.show',
  },
  {
    id: 'languages',
    icon: 'simple-icon-globe',
    label: 'menu.languages',
    to: '/app/lang',
    permission: 'lang.show',
  },
  {
    id: 'administrators',
    icon: 'iconsminds-support', // iconsminds-hipster-men, iconsminds-king-2, iconsminds-engineering
    label: 'menu.administrators',
    to: '/app/admin',
    permission: false,
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
        permission: 'settings.emailTemplate',
      },
      {
        icon: 'iconsminds-gears',
        label: 'menu.config',
        to: '/app/settings/config',
        permission: 'settings.config',
      },
      {
        icon: 'iconsminds-profile',
        label: 'menu.profile',
        to: '/app/settings/profile',
        permission: true,
      },
      {
        icon: 'iconsminds-key-lock',
        label: 'menu.password',
        to: '/app/settings/password',
        permission: true,
      },
    ],
  },
];
export default data;

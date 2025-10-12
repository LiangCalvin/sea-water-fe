import { NavItemExtend } from './core/models/mfe-models.model';

export const DEFAULT_MENU_ITEM: NavItemExtend[] = [
    // {
    //   title: 'Mainpage',
    //   iconPath: '../assets/icons/menu-main.svg',
    //   link: '/',
    //   permissions: [
    //     // RoleEnum.MAIN_PETROLEUM
    //   ],
    // },
    // {
    //   title: 'Dashboard',
    //   iconPath: '../assets/icons/menu-main.svg',
    //   permissions: [
    //     // RoleEnum.PROCUREMENT_DB_CONTRACT_SUPER,
    //     // RoleEnum.PROCUREMENT_DB_CONTRACT_MEMBER,
    //   ],
    //   children: [
    //     {
    //       title: 'Dashboard',
    //       iconPath: '',
    //       link: `/dashboard-main`,
    //       permissions: [
    //         // RoleEnum.PROCUREMENT_DB_CONTRACT_SUPER
    //       ],
    //       disabledActiveClick: true,
    //     },
    //     {
    //       title: 'Dashboard Child',
    //       iconPath: '',
    //       link: `/dashboard-child-1`,
    //       permissions: [
    //         // RoleEnum.PROCUREMENT_DB_CONTRACT_SUPER
    //       ],
    //       disabledActiveClick: true,
    //     }
    //   ],
    // },
    {
        title: 'All Studies',
        iconPath: '../assets/icons/Notebook.svg',
        link: '/all-studies',
        permissions: [
            // RoleEnum.MAIN_PETROLEUM
        ],
        disabledActiveClick: true,
    },
    {
        title: 'My Studies',
        iconPath: '../assets/icons/Notebook.svg',
        link: '/my-studies',
        permissions: [
            // RoleEnum.MAIN_PETROLEUM
        ],
        disabledActiveClick: true,
    },
];

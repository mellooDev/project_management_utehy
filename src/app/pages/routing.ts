import { Routes } from '@angular/router';
import { AuthGuard } from '../modules/auth/services/auth.guard';

const Routing: Routes = [
  {
    path: 'approve-seller',
    // canActivate: [AuthGuard],
    loadChildren: () => import('./approve-seller/approve-seller.module').then((m) => m.ApproveSellerModule),
  },
  {
    path: 'project-management',
    // canActivate: [AuthGuard],
    loadChildren: () => import('./project-management/project-management.module').then((m) => m.ProjectManagementModule),
  },
  {
    path: 'lecturer-project-management',
    // canActivate: [AuthGuard],
    loadChildren: () => import('./lecturer-project-management/lecturer-project-management.module').then((m) => m.LecturerProjectManagementModule),
  },
  {
    path: 'lecturer-approve-project',
    // canActivate: [AuthGuard],
    loadChildren: () => import('./lecturer-approve-project/lecturer-approve-project.module').then((m) => m.LecturerApproveProjectModule),
  },
  {
    path: 'instruction-management',
    // canActivate: [AuthGuard],
    loadChildren: () => import('./instruction-management/instruction-management.module').then((m) => m.InstructionManagementModule),
  },
  {
    path: 'product-provider',
    // canActivate: [AuthGuard],
    loadChildren: () => import('./product-provider/product-provider.module').then((m) => m.ProductProviderModule),
  },
  {
    path: 'buyed',
    // canActivate: [AuthGuard],
    loadChildren: () => import('./buyed/buyed.module').then((m) => m.BuyedModule),
  },
  {
    path: 'history',
    // canActivate: [AuthGuard],
    loadChildren: () => import('./history/history.module').then((m) => m.HistoryModule),
  },
  {
    path: 'profile',
    // canActivate: [AuthGuard],
    loadChildren: () => import('./profile/profile.module').then((m) => m.ProfileModule),
  },
  {
    path: 'buy/:id',
    // canActivate: [AuthGuard],
    loadChildren: () => import('./buy/buy.module').then((m) => m.BuyModule),
  },
  {
    path: 'approve-product',
    // canActivate: [AuthGuard],
    loadChildren: () => import('./approve-product/approve-product.module').then((m) => m.ApproveProductModule),
  },
  {
    path: 'marketplace',
    loadChildren: () => import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'builder',
    loadChildren: () => import('./builder/builder.module').then((m) => m.BuilderModule),
  },
  {
    path: 'crafted/pages/profile',
    loadChildren: () => import('../modules/profile/profile.module').then((m) => m.ProfileModule),
    // data: { layout: 'light-sidebar' },
  },
  {
    path: 'crafted/account',
    loadChildren: () => import('../modules/account/account.module').then((m) => m.AccountModule),
    // data: { layout: 'dark-header' },
  },
  {
    path: 'crafted/pages/wizards',
    loadChildren: () => import('../modules/wizards/wizards.module').then((m) => m.WizardsModule),
    // data: { layout: 'light-header' },
  },
  {
    path: 'crafted/widgets',
    loadChildren: () => import('../modules/widgets-examples/widgets-examples.module').then((m) => m.WidgetsExamplesModule),
    // data: { layout: 'light-header' },
  },
  {
    path: 'apps/chat',
    loadChildren: () => import('../modules/apps/chat/chat.module').then((m) => m.ChatModule),
    // data: { layout: 'light-sidebar' },
  },
  {
    path: 'apps/users',
    loadChildren: () => import('./user/user.module').then((m) => m.UserModule),
  },
  {
    path: 'apps/roles',
    loadChildren: () => import('./role/role.module').then((m) => m.RoleModule),
  },
  {
    path: 'apps/permissions',
    loadChildren: () => import('./permission/permission.module').then((m) => m.PermissionModule),
  },
  {
    path: '',
    redirectTo: '/marketplace',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'error/404',
  },
  {
    path: 'category/category-detail',
    loadChildren: () => import('./category/category.module').then((m) => m.CategoryModule),
  },
  {
    path:'products',
    loadChildren: () => import('./product/product.module').then((m) => m.ProductModule)
  },
  {
    path: 'provider/register-provider',
    loadChildren: () => import('./register-provider/register-provider.module').then((m) => m.RegisterProviderModule),
  },
  {
    // canActivate: [AuthGuard],
    path: 'data-management',
    loadChildren: () => import('./data-management/data-management.module').then((m) => m.DataManagementModule),
  },
  {
    // canActivate: [AuthGuard],
    path: 'email-template-management',
    loadChildren: () => import('./email-template-management/email-template-management.module').then((m) => m.EmailTemplateManagementModule),
  },
  {
    // canActivate: [AuthGuard],
    path: 'file-management',
    loadChildren: () => import('./file-management/file-management.module').then((m) => m.FileManagementModule),
  },
  {
    // canActivate: [AuthGuard],
    path: 'ingest',
    loadChildren: () => import('./ingest/ingest.module').then(m => m.IngestModule),
  },
  {
    // canActivate: [AuthGuard],
    path: 'users',
    loadChildren: () => import('./user-management/user-management.module').then(m => m.UserManagementModule),
  },
  {
    // canActivate: [AuthGuard],
    path: 'worksheet',
    loadChildren: () => import('./worksheet-management/worksheet-management.module').then(m => m.WorksheetManagementModule),
  },
  {
    // canActivate: [AuthGuard],
    path: 'warehouse-management',
    loadChildren: () => import('./warehouse-management/warehouse-management.module').then(m => m.WarehouseManagementModule),
  },
  {
    // canActivate: [AuthGuard],
    path: 'statistic-chart',
    loadChildren: () => import('./statistic-chart/statistic-chart.module').then(m => m.StatisticChartModule),
  },
];

export { Routing };


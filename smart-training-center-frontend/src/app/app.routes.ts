import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { dashboardRedirectGuard } from './core/guards/dashboard-redirect.guard';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    loadComponent: () => import('./shared/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', children: [
        { path: 'pedagogique', loadComponent: () => import('./features/dashboard/pedagogique/pedagogique.component').then(m => m.PedagogiqueComponent), canActivate: [roleGuard], data: { roles: ['ETUDIANT', 'ENSEIGNANT', 'ADMINISTRATEUR'] } },
        { path: 'administratif', loadComponent: () => import('./features/dashboard/administratif/administratif.component').then(m => m.AdministratifComponent), canActivate: [roleGuard], data: { roles: ['ADMINISTRATEUR'] } },
        { path: 'decisionnel', loadComponent: () => import('./features/dashboard/decisionnel/decisionnel.component').then(m => m.DecisionnelComponent), canActivate: [roleGuard], data: { roles: ['RESPONSABLE_ACADEMIQUE', 'ADMINISTRATEUR'] } },
        { path: 'iot', loadComponent: () => import('./features/dashboard/iot/iot.component').then(m => m.IotComponent), canActivate: [roleGuard], data: { roles: ['ADMINISTRATEUR'] } },
        { path: '', canActivate: [dashboardRedirectGuard], children: [] }
      ]},
      { path: 'cours', children: [
        { path: '', loadComponent: () => import('./features/cours/cours-list/cours-list.component').then(m => m.CoursListComponent) },
        { path: 'create', loadComponent: () => import('./features/cours/cours-create/cours-create.component').then(m => m.CoursCreateComponent), canActivate: [roleGuard], data: { roles: ['ENSEIGNANT', 'ADMINISTRATEUR'] } },
        { path: ':id', loadComponent: () => import('./features/cours/cours-detail/cours-detail.component').then(m => m.CoursDetailComponent) },
        { path: ':id/viewer', loadComponent: () => import('./features/cours/cours-viewer/cours-viewer.component').then(m => m.CoursViewerComponent) }
      ]},
      { path: 'evaluations', children: [
        { path: '', loadComponent: () => import('./features/evaluations/evaluation-list/evaluation-list.component').then(m => m.EvaluationListComponent) },
        { path: ':id/take', loadComponent: () => import('./features/evaluations/evaluation-take/evaluation-take.component').then(m => m.EvaluationTakeComponent) },
        { path: ':id/results', loadComponent: () => import('./features/evaluations/evaluation-results/evaluation-results.component').then(m => m.EvaluationResultsComponent) }
      ]},
      { path: 'catalogue', children: [
        { path: 'filieres', loadComponent: () => import('./features/catalogue/filieres/filieres.component').then(m => m.FilieresComponent) },
        { path: 'specialites', loadComponent: () => import('./features/catalogue/specialites/specialites.component').then(m => m.SpecialitesComponent) },
        { path: 'matieres', loadComponent: () => import('./features/catalogue/matieres/matieres.component').then(m => m.MatieresComponent) },
        { path: 'certifications', loadComponent: () => import('./features/catalogue/certifications/certifications.component').then(m => m.CertificationsComponent) },
        { path: '', redirectTo: 'filieres', pathMatch: 'full' }
      ]},
      { path: 'users', children: [
        { path: '', loadComponent: () => import('./features/users/user-list/user-list.component').then(m => m.UserListComponent), canActivate: [roleGuard], data: { roles: ['ADMINISTRATEUR'] } },
        { path: 'profile', loadComponent: () => import('./features/users/user-profile/user-profile.component').then(m => m.UserProfileComponent) },
        { path: ':id', loadComponent: () => import('./features/users/user-detail/user-detail.component').then(m => m.UserDetailComponent), canActivate: [roleGuard], data: { roles: ['ADMINISTRATEUR'] } }
      ]},
      { path: 'salles', children: [
        { path: '', loadComponent: () => import('./features/salles/salle-list/salle-list.component').then(m => m.SalleListComponent) },
        { path: ':id', loadComponent: () => import('./features/salles/salle-detail/salle-detail.component').then(m => m.SalleDetailComponent) },
        { path: ':id/monitoring', loadComponent: () => import('./features/salles/salle-monitoring/salle-monitoring.component').then(m => m.SalleMonitoringComponent) }
      ]},
      { path: 'presence', children: [
        { path: 'scan', loadComponent: () => import('./features/presence/scan/scan.component').then(m => m.ScanComponent) },
        { path: 'report', loadComponent: () => import('./features/presence/attendance-report/attendance-report.component').then(m => m.AttendanceReportComponent) },
        { path: '', redirectTo: 'scan', pathMatch: 'full' }
      ]},
      { path: 'alerts', loadComponent: () => import('./features/alerts/alert-panel/alert-panel.component').then(m => m.AlertPanelComponent), canActivate: [roleGuard], data: { roles: ['ADMINISTRATEUR'] } },
      { path: 'audit', loadComponent: () => import('./features/audit/audit-log/audit-log.component').then(m => m.AuditLogComponent), canActivate: [roleGuard], data: { roles: ['ADMINISTRATEUR'] } },
      { path: 'devices', children: [
        { path: '', loadComponent: () => import('./features/devices/device-list/device-list.component').then(m => m.DeviceListComponent), canActivate: [roleGuard], data: { roles: ['ADMINISTRATEUR'] } },
        { path: 'register', loadComponent: () => import('./features/devices/device-register/device-register.component').then(m => m.DeviceRegisterComponent), canActivate: [roleGuard], data: { roles: ['ADMINISTRATEUR'] } },
        { path: ':id', loadComponent: () => import('./features/devices/device-detail/device-detail.component').then(m => m.DeviceDetailComponent), canActivate: [roleGuard], data: { roles: ['ADMINISTRATEUR'] } }
      ]},
      { path: 'bulletins', loadComponent: () => import('./features/bulletins/bulletin-view/bulletin-view.component').then(m => m.BulletinViewComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'auth/login' }
];

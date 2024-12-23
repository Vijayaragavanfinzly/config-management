import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { TenantsComponent } from './components/tenants/tenants.component';
import { EnvironmentsComponent } from './components/environments/environments.component';
import { EnvironmentDetailsComponent } from './components/environment-details/environment-details.component';
import { AccountComponent } from './components/account/account.component';
import { TenantEnvironmentsComponent } from './components/tenant-environments/tenant-environments.component';
import { TenantEnvironmentPropertiesComponent } from './components/tenant-environment-properties/tenant-environment-properties.component';
import { CompareComponent } from './components/compare/compare.component';
import { CloneComponent } from './components/clone/clone.component';
import { CompareByTenantComponent } from './components/compare-by-tenant/compare-by-tenant.component';
import { CompareByEnvironmentComponent } from './components/compare-by-environment/compare-by-environment.component';
import { SettingsComponent } from './components/settings/settings.component';
import { CompareOnlyEnvComponent } from './components/compare-only-env/compare-only-env.component';

export const routes: Routes = [
    {
        path:'',
        component:LayoutComponent,
        children:[
            {
                path:'tenants',
                component:TenantsComponent
            },
            {
                path:'environments',
                component:EnvironmentsComponent
            },
            {
                path:'compare',
                component:CompareComponent
            },
            {
                path:'accounts',
                component:AccountComponent
            },
            {
                path:'compare/compareByTenant',
                component:CompareByTenantComponent
            },
            {
                path:'compare/compareByEnvironment',
                component:CompareByEnvironmentComponent
            },
            {
                path: 'environments/environment',
                component: EnvironmentDetailsComponent
            },
            {
                path: 'tenants/:tenant',
                component:TenantEnvironmentsComponent
            },
            {
                path: 'tenants/:tenant/:environment',
                component:TenantEnvironmentPropertiesComponent
            },
            {
                path:'clone',
                component:CloneComponent
            },
            {
                path:'settings',
                component:SettingsComponent
            },
            {
                path:'compare-environments',
                component:CompareOnlyEnvComponent
            }
        ]
    }
];
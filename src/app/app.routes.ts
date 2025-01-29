import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { TenantsComponent } from './components/tenants/tenants.component';
import { EnvironmentsComponent } from './components/environments/environments.component';
import { EnvironmentDetailsComponent } from './components/environment-details/environment-details.component';
import { TenantEnvironmentsComponent } from './components/tenant-environments/tenant-environments.component';
import { TenantEnvironmentPropertiesComponent } from './components/tenant-environment-properties/tenant-environment-properties.component';
import { CompareComponent } from './components/compare/compare.component';
import { CloneComponent } from './components/clone/clone.component';
import { CompareByTenantComponent } from './components/compare-by-tenant/compare-by-tenant.component';
import { CompareOnlyEnvComponent } from './components/compare-only-env/compare-only-env.component';
import { CompareLiveConfigComponent } from './components/compare-live-config/compare-live-config.component';
import { CompareConfigDbComponent } from './components/compare-config-db/compare-config-db.component';
import { FaqComponent } from './components/faq/faq.component';
import { SyncComponent } from './components/sync/sync.component';
import { GuideComparisonComponent } from './components/guide-comparison/guide-comparison.component';
import { GuideSyncComponent } from './components/guide-sync/guide-sync.component';
import { DeltaComponent } from './components/delta/delta.component';
import { CommonEnvironmentPropertiesComponent } from './components/common-environment-properties/common-environment-properties.component';
import { ParamStoreEnvironmentsComponent } from './components/param-store-environments/param-store-environments.component';
import { ParamStoreTenantEnvironmentPropertiesComponent } from './components/param-store-tenant-environment-properties/param-store-tenant-environment-properties.component';
import { CredentialsForAddingEnvironmentComponent } from './components/credentials-for-adding-environment/credentials-for-adding-environment.component';

export const routes: Routes = [
    {
        path:'',
        component:LayoutComponent,
        children:[
            {
                path: '',
                redirectTo: 'sync',
                pathMatch: 'full'
            },
            {
                path:'properties',
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
                path:'compare/compareByTenant',
                component:CompareByTenantComponent
            },
            {
                path:'compare/compareByEnvironment',
                component:CompareConfigDbComponent
            },
            {
                path:'compare/findDelta',
                component:DeltaComponent
            },
            {
                path: 'environments/environment',
                component: EnvironmentDetailsComponent
            },
            {
                path: 'properties/:tenant',
                component:TenantEnvironmentsComponent
            },
            {
                path: 'properties/:tenant/:environment',
                component:TenantEnvironmentPropertiesComponent
            },
            {
                path: 'commonProperty/:tenant/:environment',
                component:CommonEnvironmentPropertiesComponent
            },
            {
                path:'param-store/:tenant',
                component:ParamStoreEnvironmentsComponent
            },
            {
                path:'param-store/:tenant/:environment',
                component:ParamStoreTenantEnvironmentPropertiesComponent
            },
            {
                path:'clone',
                component:CloneComponent
            },
            {
                path:'compare-environments',
                component:CompareOnlyEnvComponent
            },
            {
                path:'config-live',
                component:CompareLiveConfigComponent
            },
            {
                path:'faq',
                component:FaqComponent
            },
            {
                path:'sync',
                component:SyncComponent
            },
            {
                path:'faq/comparison-guide',
                component:GuideComparisonComponent
            },
            {
                path:'faq/sync-guide',
                component:GuideSyncComponent
            },
            {
                path:'credentials',
                component:CredentialsForAddingEnvironmentComponent
            }
        ]
    }
];
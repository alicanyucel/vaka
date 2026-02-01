
import { Routes } from '@angular/router';
import { NotFound } from './components/not-found/not-found';
import { Layout } from './components/layout/layout';

export const routes: Routes = [
	{
		path: '',
		component: Layout,
		children: [
			{ path: '', redirectTo: 'devices', pathMatch: 'full' },
			{ path: 'devices', loadComponent: () => import('./components/device/device').then(m => m.Device) },
		]
	},
	{ path: '**', component: NotFound },
];

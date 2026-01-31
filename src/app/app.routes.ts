import { Routes } from '@angular/router';
import { NotFound } from './components/not-found/not-found';

export const routes: Routes = [
	// ...other routes
	{ path: '**', component: NotFound },
];

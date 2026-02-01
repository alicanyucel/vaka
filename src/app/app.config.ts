import '@angular/localize/init';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    // Fetch backend'i bazı ortamlarda status 0 / "disconnected" hatalarını tetikleyebiliyor.
    // Default XHR backend daha stabil.
    provideHttpClient()
  ]
};

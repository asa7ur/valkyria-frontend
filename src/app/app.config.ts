import {ApplicationConfig, provideBrowserGlobalErrorListeners} from '@angular/core';
import {provideRouter, withComponentInputBinding, withInMemoryScrolling} from '@angular/router'; // Importa withInMemoryScrolling

import {routes} from './app.routes';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {auth} from './core/interceptors/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      // Añade esta configuración aquí:
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled'
      })
    ),
    provideHttpClient(
      withInterceptors([auth])
    )
  ]
};

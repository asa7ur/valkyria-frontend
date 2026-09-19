import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthManager } from './auth-manager';
import { auth } from '../interceptors/auth';
import { AuthResponse } from '../models/auth-payments';

// JWT sin firmar con el "exp" indicado (el frontend solo lee la caducidad)
function jwt(expSeconds: number): string {
  const payload = btoa(JSON.stringify({ sub: 'user@test.com', exp: expSeconds }));
  return `x.${payload}.y`;
}

const validSession = (): AuthResponse =>
  ({ token: jwt(Math.floor(Date.now() / 1000) + 3600), username: 'user@test.com' }) as AuthResponse;

// Lo que hace otra pestaña al iniciar o cerrar sesión: cambia localStorage y el navegador avisa a esta
function otherTab(change: () => void) {
  change();
  window.dispatchEvent(new StorageEvent('storage', { key: 'user_data' }));
}

describe('AuthManager', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authManager: AuthManager;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([auth])), provideHttpClientTesting(), provideRouter([])],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authManager = TestBed.inject(AuthManager);
  });

  afterEach(() => httpMock.verify());

  it('picks up a login made in another tab', () => {
    const session = validSession();

    otherTab(() => {
      localStorage.setItem('auth_token', session.token);
      localStorage.setItem('user_data', JSON.stringify(session));
    });

    expect(authManager.currentUser()?.username).toBe('user@test.com');
  });

  it('picks up a logout made in another tab', () => {
    authManager.saveSession(validSession());

    otherTab(() => localStorage.clear());

    expect(authManager.currentUser()).toBeNull();
  });

  it('only sends the token of the session shown on screen', () => {
    // Token en localStorage que esta pestaña no reconoce como sesión (p. ej. escrito por otra pestaña
    // sin que llegara el evento): no se envía
    localStorage.setItem('auth_token', validSession().token);

    http.get('/api/v1/orders').subscribe();
    expect(httpMock.expectOne('/api/v1/orders').request.headers.has('Authorization')).toBe(false);

    const session = validSession();
    authManager.saveSession(session);

    http.get('/api/v1/orders').subscribe();
    expect(httpMock.expectOne('/api/v1/orders').request.headers.get('Authorization')).toBe(`Bearer ${session.token}`);
  });
});

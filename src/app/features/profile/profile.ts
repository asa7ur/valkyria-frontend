import {Component, inject, OnInit, signal, DestroyRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {isAdultValidator} from '../../core/validators/is-adult.validator';
import {TranslatePipe} from '@ngx-translate/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {forkJoin} from 'rxjs';
import {AuthManager} from '../../core/services/auth-manager';
import {UserApiService} from '../../core/services/user-api';
import {CheckoutLogic} from '../../core/services/checkout-logic';
import {TicketProvider} from '../../core/services/ticket-provider';
import {OrderDTO} from '../../core/models/order-schema';
import {TicketType, CampingType} from '../../core/models/ticket-types';
import {User} from '../../core/models/user';

type ProfileTab = 'orders' | 'settings';

interface SettingsForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  phone: FormControl<string>;
  birthDate: FormControl<string>;
}

interface PasswordForm {
  currentPassword: FormControl<string>;
  newPassword: FormControl<string>;
  confirmPassword: FormControl<string>;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, TranslatePipe],
  templateUrl: './profile.html'
})
export class Profile implements OnInit {
  auth = inject(AuthManager);
  private userApi = inject(UserApiService);
  private cart = inject(CheckoutLogic);
  private ticketProvider = inject(TicketProvider);
  private fb = inject(FormBuilder).nonNullable;
  private destroyRef = inject(DestroyRef);

  activeTab = signal<ProfileTab>('orders');

  // Estado pestaña Pedidos
  orders = signal<OrderDTO[]>([]);
  ticketTypes = signal<TicketType[]>([]);
  campingTypes = signal<CampingType[]>([]);
  ordersLoading = signal(true);
  expandedOrderId = signal<number | null>(null);

  // Estado pestaña Mis Datos
  profileUser = signal<User | null>(null);
  settingsLoading = signal(true);
  isSaving = signal(false);
  isChangingPassword = signal(false);
  profileFeedback = signal<{ msg: string; type: 'success' | 'error' } | null>(null);
  passwordFeedback = signal<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Estado cambio de email
  showEmailForm = signal(false);
  isRequestingEmailChange = signal(false);
  emailChangeFeedback = signal<{ msg: string; type: 'success' | 'error' } | null>(null);
  newEmailControl!: FormControl<string>;

  settingsForm!: FormGroup<SettingsForm>;
  passwordForm!: FormGroup<PasswordForm>;

  constructor() {
    this.settingsForm = this.fb.group<SettingsForm>({
      firstName: this.fb.control('', [Validators.required]),
      lastName: this.fb.control('', [Validators.required]),
      phone: this.fb.control('', [Validators.required]),
      birthDate: this.fb.control('', [Validators.required, isAdultValidator])
    });

    this.newEmailControl = this.fb.control('', [Validators.required, Validators.email]);

    this.passwordForm = this.fb.group<PasswordForm>({
      currentPassword: this.fb.control('', [Validators.required]),
      newPassword: this.fb.control('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: this.fb.control('', [Validators.required])
    });
  }

  ngOnInit() {
    forkJoin({
      orders: this.cart.getUserOrders(),
      ticketTypes: this.ticketProvider.getTicketTypes(),
      campingTypes: this.ticketProvider.getCampingTypes()
    }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.orders.success) this.orders.set(res.orders.data);
          this.ticketTypes.set(res.ticketTypes);
          this.campingTypes.set(res.campingTypes);
          this.ordersLoading.set(false);
        },
        error: () => this.ordersLoading.set(false)
      });

    this.userApi.getMe()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const user = res.data;
          this.profileUser.set(user);
          this.settingsForm.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            birthDate: user.birthDate ? user.birthDate.split('T')[0] : ''
          });
          this.settingsLoading.set(false);
        },
        error: () => this.settingsLoading.set(false)
      });
  }

  setTab(tab: ProfileTab) {
    this.activeTab.set(tab);
  }

  toggleOrderDetails(orderId: number) {
    this.expandedOrderId.update(id => id === orderId ? null : orderId);
  }

  getTicketPrice(typeName: string): number {
    return this.ticketTypes().find(t => t.name === typeName)?.price ?? 0;
  }

  getCampingPrice(typeName: string): number {
    return this.campingTypes().find(t => t.name === typeName)?.price ?? 0;
  }

  downloadCredentials(orderId: number) {
    this.cart.downloadOrderPdf(orderId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Pedido_${orderId}.pdf`;
        link.click();
      }
    });
  }

  onSaveProfile() {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    this.profileFeedback.set(null);

    this.userApi.updateMe(this.settingsForm.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.profileUser.update(u => u ? {...u, ...res.data} : u);
          this.isSaving.set(false);
          this.profileFeedback.set({msg: 'Datos actualizados correctamente', type: 'success'});
          setTimeout(() => this.profileFeedback.set(null), 3000);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.profileFeedback.set({msg: err.error?.message || 'Error al actualizar los datos', type: 'error'});
        }
      });
  }

  onChangePassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const vals = this.passwordForm.getRawValue();
    if (vals.newPassword !== vals.confirmPassword) {
      this.passwordFeedback.set({msg: 'Las contraseñas no coinciden', type: 'error'});
      return;
    }

    this.isChangingPassword.set(true);
    this.passwordFeedback.set(null);

    this.userApi.changeMyPassword(vals)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isChangingPassword.set(false);
          this.passwordFeedback.set({msg: 'Contraseña actualizada correctamente', type: 'success'});
          this.passwordForm.reset();
          setTimeout(() => this.passwordFeedback.set(null), 3000);
        },
        error: (err) => {
          this.isChangingPassword.set(false);
          this.passwordFeedback.set({msg: err.error?.message || 'Error al cambiar la contraseña', type: 'error'});
        }
      });
  }

  onRequestEmailChange() {
    if (this.newEmailControl.invalid) {
      this.newEmailControl.markAsTouched();
      return;
    }
    this.isRequestingEmailChange.set(true);
    this.emailChangeFeedback.set(null);

    this.userApi.requestEmailChange(this.newEmailControl.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isRequestingEmailChange.set(false);
          this.showEmailForm.set(false);
          this.newEmailControl.reset();
          this.emailChangeFeedback.set({msg: 'Enlace de verificación enviado a tu nuevo correo', type: 'success'});
        },
        error: (err) => {
          this.isRequestingEmailChange.set(false);
          this.emailChangeFeedback.set({msg: err.error?.message || 'Error al solicitar el cambio', type: 'error'});
        }
      });
  }
}

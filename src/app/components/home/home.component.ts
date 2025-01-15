import { Component, OnDestroy, OnInit } from '@angular/core';
import { EthersService } from '../../services/ethers.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

export enum ImplementationContractAddress {
  ImplementationV1 = '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  ImplementationV2 = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  ImplementationV3 = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
}

export enum ConnectionStatus {
  Disconnected = 'Disconnected',
  User = 'User',
  Admin = 'Admin',
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
})
export class HomeComponent implements OnInit, OnDestroy {
  formGroup!: FormGroup;
  options: Array<{ value: ImplementationContractAddress; label: string }> = [
    {
      value: ImplementationContractAddress.ImplementationV1,
      label: 'ImplementationV1',
    },
    {
      value: ImplementationContractAddress.ImplementationV2,
      label: 'ImplementationV2',
    },
    {
      value: ImplementationContractAddress.ImplementationV3,
      label: 'ImplementationV3',
    },
  ];

  ConnectionStatus = ConnectionStatus;

  inputValue: string = '';
  num1Sum: number = 0;
  num2Sum: number = 0;
  num1Mul: number = 0;
  num2Mul: number = 0;
  num1Sub: number = 0;
  num2Sub: number = 0;
  totalValue?: number;
  title = 'Home Component';
  status: string = 'Not connected';
  currentImplementationAddress: ImplementationContractAddress | null = null;
  private addressChangeSubscription?: Subscription;
  private totalValueChangeSubscription?: Subscription;
  private connectedWalletAddressSubscription?: Subscription;

  readonly ImplementationContractAddress = ImplementationContractAddress;

  walletConnected = ConnectionStatus.Disconnected;

  constructor(private ethersService: EthersService, private fb: FormBuilder) {}

  ngOnInit() {
    this.formGroup = this.fb.group({
      dropdown: ['', Validators.required],
    });

    this.totalValueChangeSubscription =
      this.ethersService.totalValueChange$.subscribe((totalValue) => {
        this.num1Sum = 0;
        this.num2Sum = 0;
        this.num1Mul = 0;
        this.num2Mul = 0;
        this.num1Sub = 0;
        this.num2Sub = 0;
        this.totalValue = totalValue;
      });

    this.connectedWalletAddressSubscription =
      this.ethersService.connectedWalletAddress$.subscribe((address) => {
        this.walletConnected =
          address === null || address === ''
            ? ConnectionStatus.Disconnected
            : address === '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
            ? ConnectionStatus.Admin
            : ConnectionStatus.User;
      });

    this.addressChangeSubscription =
      this.ethersService.addressChange$.subscribe((address) => {
        switch (address) {
          case ImplementationContractAddress.ImplementationV1:
            this.currentImplementationAddress =
              ImplementationContractAddress.ImplementationV1;
            break;
          case ImplementationContractAddress.ImplementationV2:
            this.currentImplementationAddress =
              ImplementationContractAddress.ImplementationV2;
            break;
          case ImplementationContractAddress.ImplementationV3:
            this.currentImplementationAddress =
              ImplementationContractAddress.ImplementationV3;
            break;
          default:
            this.currentImplementationAddress = null;
            break;
        }
      });
  }

  ngOnDestroy() {
    this.addressChangeSubscription?.unsubscribe();
    this.totalValueChangeSubscription?.unsubscribe();
    this.connectedWalletAddressSubscription?.unsubscribe();
  }

  onSubmit() {
    if (this.formGroup.valid) {
      this.ethersService.upgradeContractVersion(this.formGroup.value.dropdown);
    }
  }

  async sum() {
    try {
      await this.ethersService.callMethod(this.num1Sum, this.num2Sum, 'sum');
      this.status = 'Transaction successful!';
    } catch (error) {
      throw error;
    }
  }

  async multiply() {
    try {
      await this.ethersService.callMethod(
        this.num1Mul,
        this.num2Mul,
        'multiply'
      );
      this.status = 'Transaction successful!';
    } catch (error) {
      throw error;
    }
  }

  async subtract() {
    try {
      await this.ethersService.callMethod(
        this.num1Sub,
        this.num2Sub,
        'subtract'
      );
      this.status = 'Transaction successful!';
    } catch (error) {
      throw error;
    }
  }
}

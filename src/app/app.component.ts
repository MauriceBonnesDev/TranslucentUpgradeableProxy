import { Component } from '@angular/core';
import { HomeComponent } from './components/home/home.component';
import { EthersService } from './services/ethers.service';

@Component({
  selector: 'app-root',
  imports: [HomeComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  userAddress: string | null = null;

  constructor(private ethersService: EthersService) {
    this.ethersService.connectedWalletAddress$.subscribe((address) => {
      this.userAddress = address;
    });
  }

  sliceAddress(): string {
    if (!this.userAddress) {
      return 'Connect Wallet';
    }

    return `${this.userAddress.slice(0, 6)} ... ${this.userAddress.slice(-4)}`;
  }

  async connectWallet() {
    await this.ethersService.connectDisconnectWallet();
  }
}

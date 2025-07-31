import { Injectable, ViewContainerRef, ComponentRef, Injector } from '@angular/core';
import { PopupMessageComponent } from './popup-message';

@Injectable({ providedIn: 'root' })
export class PopupService {
  private vcr?: ViewContainerRef;
  private activePopups: ComponentRef<PopupMessageComponent>[] = [];

  setViewContainer(vcr: ViewContainerRef) {
    this.vcr = vcr;
  }

  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    if (!this.vcr) return;

    const popupRef = this.vcr.createComponent(PopupMessageComponent);
    popupRef.instance.message = message;
    popupRef.instance.type = type;

    this.activePopups.push(popupRef);

    setTimeout(() => {
      const index = this.activePopups.indexOf(popupRef);
      if (index > -1) {
        this.activePopups.splice(index, 1);
        popupRef.destroy();
      }
    }, 3000);
  }
}
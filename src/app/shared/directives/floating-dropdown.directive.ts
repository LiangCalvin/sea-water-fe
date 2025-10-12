import {
  Directive,
  Input,
  OnDestroy,
  OnInit,
  Inject,
  NgZone
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { computePosition, offset, flip, shift, autoUpdate } from '@floating-ui/dom';

@Directive({
  selector: '[floatingDropdown]',
  standalone: true,
  exportAs: 'floatingDropdown'
})
export class FloatingDropdownDirective implements OnInit, OnDestroy {
  @Input('floatingDropdown') triggerRef!: HTMLElement;
  @Input() overlayClass?: string;
  @Input() set nzVisible(visible: boolean) {
    this.toggle(visible);
  }

  private cleanupAutoUpdate?: () => void;
  private mo?: MutationObserver;

  constructor(
    @Inject(DOCUMENT) private doc: Document,
    private ngZone: NgZone,
  ) { }

  ngOnInit() {
    if (!this.triggerRef) {
      console.warn('[FloatingDropdown] ต้องส่ง triggerRef ให้ directive');
    }
  }

  ngOnDestroy() {
    this.stop();
  }

  private toggle(visible: boolean) {
    if (!this.triggerRef) return;

    if (visible) {
      this.stop();
      const container = this.doc.querySelector('.cdk-overlay-container');
      if (!container) return;

      const hook = (): boolean => {
        const overlayEl = this.pickOverlayElement(container);
        if (!overlayEl) return false;

        this.ngZone.runOutsideAngular(() => {
          overlayEl.style.width = `${this.triggerRef.offsetWidth}px`;
          overlayEl.style.maxHeight = '300px';
          overlayEl.style.overflowY = 'auto';

          this.cleanupAutoUpdate = autoUpdate(this.triggerRef, overlayEl, () => {
            computePosition(this.triggerRef, overlayEl, {
              placement: 'bottom-start',
              strategy: 'absolute',
              middleware: [
                offset(4),
                flip(),
                shift({ padding: { top: 60, bottom: 60 } })
              ]
            }).then(({ x, y }) => {
              Object.assign(overlayEl.style, {
                position: 'absolute',
                top: `${y}px`,
                left: `${x}px`,
                transform: 'translate3d(0,0,0)',
                willChange: 'top, left',
                width: `${this.triggerRef.offsetWidth}px`,
              } as CSSStyleDeclaration);


              const rect = overlayEl.getBoundingClientRect();
              overlayEl.style.opacity = rect.top <= 0 ? '0' : '1';

            });
          });
        });

        return true;
      };

      if (!hook()) {
        this.mo = new MutationObserver(() => {
          if (hook() && this.mo) {
            this.mo.disconnect();
            this.mo = undefined;
          }
        });
        this.mo.observe(container, { childList: true, subtree: true });
      }

    } else {
      this.stop();
    }
  }

  private pickOverlayElement(container: Element): HTMLElement | null {
    if (this.overlayClass) {
      const el = container.querySelector(`.cdk-overlay-pane .ant-dropdown.${this.overlayClass}`) as HTMLElement | null;
      if (el) return el;
    }

    const candidates = Array.from(container.querySelectorAll('.cdk-overlay-pane .ant-dropdown')) as HTMLElement[];
    const visible = candidates.filter(el => el.offsetParent !== null);
    if (visible.length) return visible[visible.length - 1];

    return candidates.length ? candidates[candidates.length - 1] : null;
  }

  private stop() {
    if (this.cleanupAutoUpdate) {
      this.cleanupAutoUpdate();
      this.cleanupAutoUpdate = undefined;
    }
    if (this.mo) {
      this.mo.disconnect();
      this.mo = undefined;
    }
  }
}

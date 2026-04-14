import { AfterViewInit, Directive, ElementRef, OnDestroy, output } from '@angular/core';

@Directive({
  selector: '[aasObserveVisibility]',
})
export class ObserveVisibilityDirective implements AfterViewInit, OnDestroy {
  visible = output<void>();

  private intersectionObserver?: IntersectionObserver;

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.visible.emit();
      return;
    }

    const rootElement = this.findScrollParent(this.elementRef.nativeElement);
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.visible.emit();
          this.intersectionObserver?.disconnect();
          this.intersectionObserver = undefined;
        }
      },
      {
        root: rootElement,
        rootMargin: '120px 0px',
      },
    );

    this.intersectionObserver.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = undefined;
  }

  private findScrollParent(element: HTMLElement): HTMLElement | null {
    let current: HTMLElement | null = element.parentElement;

    while (current != null) {
      const styles = window.getComputedStyle(current);
      const hasScrollableOverflow = /(auto|scroll)/.test(`${styles.overflow}${styles.overflowY}${styles.overflowX}`);
      if (hasScrollableOverflow && current.scrollHeight > current.clientHeight) {
        return current;
      }
      current = current.parentElement;
    }

    return null;
  }
}

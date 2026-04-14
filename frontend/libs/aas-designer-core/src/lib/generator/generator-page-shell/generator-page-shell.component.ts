import { NgClass } from '@angular/common';
import { afterNextRender, Component, DestroyRef, ElementRef, inject, input, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'aas-generator-page-shell',
  templateUrl: './generator-page-shell.component.html',
  styleUrl: './generator-page-shell.component.scss',
  host: {
    class: 'flex flex-col flex-1',
    '[style.--generator-shell-sidebar-max-height]': 'sidebarMaxHeight()',
  },
  imports: [NgClass, TranslateModule],
})
export class GeneratorPageShellComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private previousActiveSidebarIndex: number | null = null;

  readonly title = input('');
  readonly titleKey = input('');
  readonly subtitle = input('');
  readonly contentCardClass = input('');
  readonly showSidebar = input(false);
  readonly showActions = input(false);
  readonly sidebarMaxHeight = signal('min(70dvh, 42rem)');

  private getSidebarScrollContainer(activeNavItem: HTMLElement): HTMLElement | null {
    const hostElement = this.elementRef.nativeElement;
    const explicitContainer = activeNavItem.closest<HTMLElement>('.sidebar-tree-list, .battery-editor-nav-list');

    if (explicitContainer != null) {
      return explicitContainer;
    }

    let currentElement = activeNavItem.parentElement;

    while (currentElement != null && currentElement !== hostElement) {
      const computedStyle = window.getComputedStyle(currentElement);
      const isScrollable =
        /(auto|scroll|overlay)/.test(computedStyle.overflowY) &&
        currentElement.scrollHeight > currentElement.clientHeight;

      if (isScrollable) {
        return currentElement;
      }

      currentElement = currentElement.parentElement;
    }

    return null;
  }

  private scrollActiveSidebarItemIntoView(activeNavItem: HTMLElement, scrollBlock: ScrollLogicalPosition): void {
    const scrollContainer = this.getSidebarScrollContainer(activeNavItem);

    if (scrollContainer == null) {
      activeNavItem.scrollIntoView({
        block: scrollBlock,
        inline: 'nearest',
        behavior: 'smooth',
      });
      return;
    }

    const containerRect = scrollContainer.getBoundingClientRect();
    const itemRect = activeNavItem.getBoundingClientRect();
    const verticalPadding = 8;
    const isAboveViewport = itemRect.top < containerRect.top + verticalPadding;
    const isBelowViewport = itemRect.bottom > containerRect.bottom - verticalPadding;

    if (!isAboveViewport && !isBelowViewport) {
      return;
    }

    const targetScrollTop =
      scrollBlock === 'end'
        ? activeNavItem.offsetTop + activeNavItem.offsetHeight - scrollContainer.clientHeight + verticalPadding
        : activeNavItem.offsetTop - verticalPadding;

    scrollContainer.scrollTo({
      top: Math.max(targetScrollTop, 0),
      behavior: 'smooth',
    });
  }

  constructor() {
    afterNextRender(() => {
      if (typeof window === 'undefined') {
        return;
      }

      const updateSidebarMaxHeight = () => {
        const hostElement = this.elementRef.nativeElement as HTMLElement;
        const sidebarElement = hostElement.querySelector('.battery-editor-sidebar') as HTMLElement | null;
        const referenceRect = sidebarElement?.getBoundingClientRect() ?? hostElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportPadding = 24;
        const availableHeight = Math.max(
          viewportHeight - Math.max(referenceRect.top, viewportPadding) - viewportPadding,
          240,
        );

        this.sidebarMaxHeight.set(`${Math.round(availableHeight)}px`);
      };

      updateSidebarMaxHeight();

      const syncActiveSidebarItemIntoView = () => {
        const hostElement = this.elementRef.nativeElement as HTMLElement;
        const navItems = Array.from(hostElement.querySelectorAll<HTMLElement>('.battery-editor-nav-item'));
        const activeNavItem = navItems.find((item) => item.classList.contains('is-active'));

        if (activeNavItem == null) {
          this.previousActiveSidebarIndex = null;
          return;
        }

        const activeIndex = navItems.indexOf(activeNavItem);
        const scrollBlock: ScrollLogicalPosition =
          this.previousActiveSidebarIndex != null && activeIndex > this.previousActiveSidebarIndex ? 'end' : 'nearest';

        this.previousActiveSidebarIndex = activeIndex;
        this.scrollActiveSidebarItemIntoView(activeNavItem, scrollBlock);
      };

      queueMicrotask(() => syncActiveSidebarItemIntoView());

      const resizeObserver = new ResizeObserver(() => updateSidebarMaxHeight());
      resizeObserver.observe(this.elementRef.nativeElement);

      const mutationObserver = new MutationObserver((mutations) => {
        const hasRelevantSidebarChange = mutations.some(
          (mutation) =>
            mutation.type === 'childList' ||
            (mutation.type === 'attributes' &&
              (mutation.target as Element).classList.contains('battery-editor-nav-item')),
        );

        if (!hasRelevantSidebarChange) {
          return;
        }

        queueMicrotask(() => syncActiveSidebarItemIntoView());
      });
      mutationObserver.observe(this.elementRef.nativeElement, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['class'],
      });

      const handleViewportChange = () => updateSidebarMaxHeight();
      window.addEventListener('resize', handleViewportChange);
      window.addEventListener('scroll', handleViewportChange, true);

      this.destroyRef.onDestroy(() => {
        resizeObserver.disconnect();
        mutationObserver.disconnect();
        window.removeEventListener('resize', handleViewportChange);
        window.removeEventListener('scroll', handleViewportChange, true);
      });
    });
  }
}

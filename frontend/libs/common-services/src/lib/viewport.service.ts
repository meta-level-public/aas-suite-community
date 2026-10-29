import { BreakpointObserver } from '@angular/cdk/layout';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

/** Same limit as Tailwind's "md" breakpoint, below it the compact phone layout is used */
export const MOBILE_VIEWPORT_QUERY = '(max-width: 767.98px)';

@Injectable({ providedIn: 'root' })
export class ViewportService {
  private breakpointObserver = inject(BreakpointObserver);

  readonly isMobile = toSignal(
    this.breakpointObserver.observe(MOBILE_VIEWPORT_QUERY).pipe(map((state) => state.matches)),
    { initialValue: this.breakpointObserver.isMatched(MOBILE_VIEWPORT_QUERY) },
  );
}

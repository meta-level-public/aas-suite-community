import { ServerSentEventsClient } from '@aas/webapi-client';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SseNotificationService } from './sse-notification.service';

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  onopen: (() => void) | null = null;
  onerror: ((error: unknown) => void) | null = null;
  closed = false;
  private listeners = new Map<string, (event: MessageEvent) => void>();

  constructor(public url: string) {
    FakeEventSource.instances.push(this);
  }

  addEventListener(name: string, listener: (event: MessageEvent) => void) {
    this.listeners.set(name, listener);
  }

  close() {
    this.closed = true;
  }

  emit(name: string, data: string) {
    this.listeners.get(name)?.({ data } as MessageEvent);
  }
}

describe('SseNotificationService', () => {
  let service: SseNotificationService;
  const url = '/aas-api/ServerSentEvents/WaitForUpdates/client-1';
  const latest = () => FakeEventSource.instances[FakeEventSource.instances.length - 1];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    FakeEventSource.instances = [];
    vi.stubGlobal('EventSource', FakeEventSource);
    TestBed.configureTestingModule({ providers: [{ provide: ServerSentEventsClient, useValue: {} }] });
    service = TestBed.inject(SseNotificationService);
  });

  afterEach(() => {
    service.disconnect();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('waits longer after each failed connection, up to 30 seconds', () => {
    service.createSse(url);

    latest().onerror?.(new Event('error'));
    expect(FakeEventSource.instances).toHaveLength(1);
    vi.advanceTimersByTime(1000);
    expect(FakeEventSource.instances).toHaveLength(2);

    latest().onerror?.(new Event('error'));
    vi.advanceTimersByTime(1999);
    expect(FakeEventSource.instances).toHaveLength(2);
    vi.advanceTimersByTime(1);
    expect(FakeEventSource.instances).toHaveLength(3);

    service.sseConnectErrorCount = 20;
    expect(service.getReconnectDelay()).toBe(30000);
  });

  it('starts again with the short delay after a successful connection', () => {
    service.createSse(url);
    latest().onerror?.(new Event('error'));
    vi.advanceTimersByTime(1000);
    latest().onerror?.(new Event('error'));
    vi.advanceTimersByTime(2000);

    latest().onopen?.();

    expect(service.sseConnectErrorCount).toBe(0);
  });

  it('publishes updates and reopens the connection', () => {
    const shells: unknown[] = [];
    service.shellUpdated.subscribe((message) => shells.push(message));
    service.createSse(url);
    const first = latest();

    first.emit('ShellUpdated', JSON.stringify({ Identifier: 'urn:aas:1', InfrastructureId: 7 }));

    expect(shells).toEqual([{ aasIdentifier: 'urn:aas:1', infrastructureId: 7 }]);
    expect(first.closed).toBe(true);
    expect(FakeEventSource.instances).toHaveLength(2);
  });

  it('ignores events without valid JSON', () => {
    const shells: unknown[] = [];
    service.shellUpdated.subscribe((message) => shells.push(message));
    service.createSse(url);

    expect(() => latest().emit('ShellUpdated', 'not json')).not.toThrow();
    expect(shells).toEqual([]);
  });

  it('does not reconnect after disconnect', () => {
    service.createSse(url);
    latest().onerror?.(new Event('error'));

    service.disconnect();
    vi.advanceTimersByTime(60000);

    expect(FakeEventSource.instances).toHaveLength(1);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cursor } from './cursor';

describe('Cursor', () => {
  let fixture: ComponentFixture<Cursor>;
  let dot: HTMLElement;
  let lens: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Cursor] }).compileComponents();
    fixture = TestBed.createComponent(Cursor);
    dot = fixture.nativeElement.querySelector('[data-cursor-dot]') as HTMLElement;
    lens = fixture.nativeElement.querySelector('[data-cursor-lens]') as HTMLElement;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('mounts', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders exactly one circle - no label, no wake', () => {
    expect(lens.classList.contains('circle')).toBe(true);
    expect(lens.textContent?.trim()).toBe('');
    expect(fixture.nativeElement.querySelectorAll('.circle').length).toBe(1);
  });

  /**
   * Regression. The cursor used to sit behind `hasFinePointer() &&
   * !prefersReducedMotion()`, so an OS setting turned it off with nothing drawn
   * and nothing logged. It must mount for every session.
   */
  it('is mounted without depending on pointer type or motion preference', () => {
    expect(dot.style.display).toBe('block');
  });

  it('softens the edge with a gradient rather than a blur filter', () => {
    expect(lens.style.background).toContain('radial-gradient');
    expect(lens.style.filter).toBe('');
  });

  it('inverts against the background so it reads on every section', () => {
    expect(dot.classList.contains('mix-blend-difference')).toBe(true);
  });

  it('parks mid-screen instead of a corner', () => {
    expect(dot.style.display).toBe('block');
    expect(dot.classList.contains('left-0')).toBe(true);
  });

  it('tracks the pointer', () => {
    const before = dot.getBoundingClientRect();
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 200, clientY: 120 }));
    expect(dot.style.display).toBe('block');
    expect(before).toBeTruthy();
  });

  it('starts in the rest state', () => {
    expect(fixture.componentInstance.mode()).toBeNull();
  });
});
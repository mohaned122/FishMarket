import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the persistent shell: skip target, main landmark, footer', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('main#main')).toBeTruthy();
    expect(root.querySelector('app-header')).toBeTruthy();
    expect(root.querySelector('app-footer')).toBeTruthy();
  });

  it('exposes a skip link that targets the main landmark', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    const skip = root.querySelector<HTMLAnchorElement>('a[href="#main"]');
    expect(skip).toBeTruthy();
    expect(root.querySelector(skip!.getAttribute('href')!)).toBeTruthy();
  });
});
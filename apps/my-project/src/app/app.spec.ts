import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { Hero } from '@my-project/ui';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, Hero],
    }).compileComponents();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Welcome demo');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PromptComponent } from './prompt.component';
import { EnvironmentConfigurationService } from '../../../services/environment-configuration.service';

describe('PromptComponent', () => {
  let component: PromptComponent;
  let fixture: ComponentFixture<PromptComponent>;

  const mockEnvConfigService = {
    getBaseUrl: () => 'http://mock-api.com/base',
    getBaseXBrain: () => 'http://mock-api.com'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,  
        PromptComponent      
      ],
      providers: [
        { provide: EnvironmentConfigurationService, useValue: mockEnvConfigService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open new tab with BASE_XBRAIN_URL', () => {
    const openSpy = spyOn(window, 'open');
    component.openNewTab();
    expect(openSpy).toHaveBeenCalledWith('http://mock-api.com', '_blank');
  });

  
  it('should copy prompt text', async () => {
    component.promptRef = {
      nativeElement: { innerText: 'Hello world' }
    } as any;

    const writeTextSpy = jasmine.createSpy().and.returnValue(Promise.resolve());

    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextSpy },
      writable: true
    });

    await component.copyPrompt();

    expect(writeTextSpy).toHaveBeenCalledWith('Hello world');
  });

});

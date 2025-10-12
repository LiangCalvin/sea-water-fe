import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverviewSummaryComponent } from './overview-summary.component';
import { UserNameService } from '../../../../../../shared/services/user-name.service';
import { SimpleChange } from '@angular/core';
import { connectionType, mapMaterialType, mappingConnectionType, mappingStemType, mappingThermowellMaterial, mappingWakeFrequency, mapRegion, mapSpanType, materialType, region, spanType, stemType, thermowellMaterial, wakeFrequencyType } from '../../../../../../core/enums/calculation.enum';

describe('OverviewSummaryComponent', () => {
  let component: OverviewSummaryComponent;
  let fixture: ComponentFixture<OverviewSummaryComponent>;
  let mockUserNameService: jasmine.SpyObj<UserNameService>;

  beforeEach(async () => {
    mockUserNameService = jasmine.createSpyObj('UserNameService', [
      'getUserName',
      'formatOneDecimalIfNeeded'
    ]);

    await TestBed.configureTestingModule({
      imports: [OverviewSummaryComponent],
      providers: [
        { provide: UserNameService, useValue: mockUserNameService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewSummaryComponent);
    component = fixture.componentInstance;

    // default input
    component.details = [
      {
        title: 'Position 1 production Manifold',
        items: [
          { type: 'fit_for_service' },
          { type: 'line_sizing' },
          { type: 'flow_induced_vibration' },
          { type: 'erosianol_velocity' },
          { type: 'temperature_profile' },
          { type: 'pressure' },
          { type: 'sour_service' },
          { type: 'wake_frequency' }
        ]
      }
    ];
  });



  describe('Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('ngOnChanges', () => {
    it('should call checkTemplate and checkDetail when title changes', () => {
      spyOn(component, 'checkTemplate');
      spyOn(component, 'checkDetail');

      component.ngOnChanges({
        title: new SimpleChange(null, 'New Title', true)
      });

      expect(component.checkTemplate).toHaveBeenCalled();
      expect(component.checkDetail).toHaveBeenCalled();
    });
  });

  describe('checkTemplate', () => {
    it('should set all boolean flags correctly', () => {
      component.checkTemplate();

      expect(component.isFitForService).toBeTrue();
      expect(component.isLineSizing).toBeTrue();
      expect(component.isFivLof).toBeTrue();
      expect(component.isErosionalVelocity).toBeTrue();
      expect(component.isTemperatureProfile).toBeTrue();
      expect(component.isPressureProfile).toBeTrue();
      expect(component.isSourService).toBeTrue();
      expect(component.isThermowell).toBeTrue();
    });

    it('should not fail if details or items are undefined', () => {
      component.details = [{ title: 'Position 1 production Manifold' }];
      expect(() => component.checkTemplate()).not.toThrow();

      component.details = undefined;
      expect(() => component.checkTemplate()).not.toThrow();
    });

    it('should leave flags false if items do not match types', () => {
      component.details = [
        { title: 'Position 1 production Manifold', items: [{ type: 'unknown' }] }
      ];
      component.checkTemplate();

      expect(component.isFitForService).toBeFalse();
      expect(component.isLineSizing).toBeFalse();
      expect(component.isFivLof).toBeFalse();
      expect(component.isErosionalVelocity).toBeFalse();
      expect(component.isTemperatureProfile).toBeFalse();
      expect(component.isPressureProfile).toBeFalse();
      expect(component.isSourService).toBeFalse();
      expect(component.isThermowell).toBeFalse();
    });
  });

  describe('checkDetail', () => {
    beforeEach(() => {
      component.details = [
        {
          title: 'Position 1 production Manifold',
          items: [
            { type: 'fit_for_service', value: 1 },
            { type: 'line_sizing', value: 2 },
            { type: 'flow_induced_vibration', value: 3 },
            { type: 'erosianol_velocity', value: 4 },
            { type: 'temperature_profile', value: 5 },
            { type: 'pressure', value: 6 },
            { type: 'sour_service', value: 7 },
            { type: 'wake_frequency', value: 8 }
          ]
        }
      ];
      component.title = 'Position 1 production Manifold';
    });

    it('should set promptData and all criteria correctly', () => {
      component.checkDetail();

      expect(component.promptData).toEqual(component.details[0]);
      expect(component.fitForServiceCriteria).toEqual({ type: 'fit_for_service', value: 1 });
      expect(component.lineSizingCriteria).toEqual({ type: 'line_sizing', value: 2 });
      expect(component.fivLofCriteria).toEqual({ type: 'flow_induced_vibration', value: 3 });
      expect(component.erosionalVelocityCriteria).toEqual({ type: 'erosianol_velocity', value: 4 });
      expect(component.temperatureProfileCriteria).toEqual({ type: 'temperature_profile', value: 5 });
      expect(component.pressureProfileCriteria).toEqual({ type: 'pressure', value: 6 });
      expect(component.sourServiceCriteria).toEqual({ type: 'sour_service', value: 7 });
      expect(component.thermowell).toEqual({ type: 'wake_frequency', value: 8 });
    });

    it('should not fail if details or items are undefined', () => {
      component.details = [{ title: 'Position 1 production Manifold' }];
      expect(() => component.checkDetail()).not.toThrow();

      component.details = undefined;
      expect(() => component.checkDetail()).not.toThrow();
    });

    it('should leave criteria undefined if items do not match types', () => {
      component.details = [
        { title: 'Position 1 production Manifold', items: [{ type: 'unknown' }] }
      ];
      component.checkDetail();

      expect(component.fitForServiceCriteria).toBeUndefined();
      expect(component.lineSizingCriteria).toBeUndefined();
      expect(component.fivLofCriteria).toBeUndefined();
      expect(component.erosionalVelocityCriteria).toBeUndefined();
      expect(component.temperatureProfileCriteria).toBeUndefined();
      expect(component.pressureProfileCriteria).toBeUndefined();
      expect(component.sourServiceCriteria).toBeUndefined();
      expect(component.thermowell).toBeUndefined();
    });
  });

  describe('Display helper methods', () => {

    it('displayMaterialType should return mapped material name or empty string', () => {
      expect(component.displayMaterialType(materialType.CARBON_STEEL_ID)).toBe('Carbon Steel');
      expect(component.displayMaterialType(materialType.STAINLESS_ID)).toBe('Stainless Steel');
      expect(component.displayMaterialType('unknown' as any)).toBe('');
    });

    it('displaySpanType should return mapped span name or empty string', () => {
      expect(component.displaySpanType(spanType.STIFF_ID)).toBe('Stiff');
      expect(component.displaySpanType('unknown')).toBe('');
    });

    it('displayRegion should return mapped region name or empty string', () => {
      expect(component.displayRegion(region.REGION_ID_1)).toBe('Region 1');
      expect(component.displayRegion('unknown')).toBe('');
    });

    it('displayWakeFrequency should return mapped wake frequency or empty string', () => {
      expect(component.displayWakeFrequency(wakeFrequencyType.GAS)).toBe('Gas');
      expect(component.displayWakeFrequency('unknown' as any)).toBe('');
    });

    it('displayStemType should return mapped stem type or empty string', () => {
      expect(component.displayStemType(stemType.STRAIGHT)).toBe('Straight');
      expect(component.displayStemType('unknown' as any)).toBe('');
    });

    it('displayConnectionType should return mapped connection type or empty string', () => {
      expect(component.displayConnectionType(connectionType.FLANGE)).toBe('Flange');
      expect(component.displayConnectionType('unknown' as any)).toBe('');
    });

    it('displayThermowellMaterial should return mapped thermowell material or empty string', () => {
      expect(component.displayThermowellMaterial(thermowellMaterial.SS_316L)).toBe('316L SS');
      expect(component.displayThermowellMaterial('unknown' as any)).toBe('');
    });
  });

});

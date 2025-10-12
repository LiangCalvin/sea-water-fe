export function cleanObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj
        .map(cleanObject)
        .filter(item => item !== undefined && item !== null);
    }
  
    if (typeof obj === 'object' && obj !== null) {
      const cleaned: any = {};
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        const isEmpty =
          value === '' ||
          value === null ||
          value === undefined ||
          (typeof value === 'number' && isNaN(value));
  
        if (!isEmpty) {
          const cleanedValue = cleanObject(value);
          if (
            cleanedValue !== null &&
            cleanedValue !== undefined &&
            !(typeof cleanedValue === 'object' && Object.keys(cleanedValue).length === 0)
          ) {
            cleaned[key] = cleanedValue;
          }
        }
      });
      return cleaned;
    }
  
    return obj;
  }
  
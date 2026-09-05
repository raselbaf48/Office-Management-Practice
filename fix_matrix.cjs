const fs = require('fs');
let code = fs.readFileSync('src/data/officialDutyRatioMatrix.ts', 'utf8');

// We need to import getCustomDuties
if (!code.includes("getCustomDuties")) {
    const importStatement = `import { getCustomDuties } from '../utils/customDuties';\n`;
    code = importStatement + code;
}

const oldGetStored = `        if (missing.length > 0) {
          return [...updatedParsed, ...missing];
        }
        return updatedParsed;
      }
    }
  } catch (e) {
    console.error('Failed to load stored duty matrix:', e);
  }
  return INITIAL_OFFICIAL_DUTY_MATRIX;
}`;

const newGetStored = `        let finalMatrix = updatedParsed;
        if (missing.length > 0) {
          finalMatrix = [...updatedParsed, ...missing];
        }
        
        // Dynamically append custom duties if they are missing
        const customDuties = getCustomDuties();
        const existingMatrixIds = new Set(finalMatrix.map(t => t.id));
        
        customDuties.forEach(cd => {
           const id = cd.code.toLowerCase() + '_duty';
           if (!existingMatrixIds.has(id)) {
               finalMatrix.push({
                  id,
                  title: cd.name,
                  dutyCode: cd.code as any,
                  totalRequiredMonth: 0,
                  totalRequiredDaily: 0,
                  data: {
                    Mechanics: Array(31).fill(0),
                    Avionics: Array(31).fill(0),
                    GCS: Array(31).fill(0),
                    Admin: Array(31).fill(0),
                  }
               });
           }
        });

        return finalMatrix;
      }
    }
  } catch (e) {
    console.error('Failed to load stored duty matrix:', e);
  }
  
  // Default fallback
  const baseMatrix = [...INITIAL_OFFICIAL_DUTY_MATRIX];
  const customDuties = getCustomDuties();
  customDuties.forEach(cd => {
      const id = cd.code.toLowerCase() + '_duty';
      if (!baseMatrix.find(t => t.id === id)) {
          baseMatrix.push({
             id,
             title: cd.name,
             dutyCode: cd.code as any,
             totalRequiredMonth: 0,
             totalRequiredDaily: 0,
             data: {
               Mechanics: Array(31).fill(0),
               Avionics: Array(31).fill(0),
               GCS: Array(31).fill(0),
               Admin: Array(31).fill(0),
             }
          });
      }
  });
  return baseMatrix;
}`;

if (code.includes('if (missing.length > 0) {')) {
   code = code.replace(oldGetStored, newGetStored);
   fs.writeFileSync('src/data/officialDutyRatioMatrix.ts', code);
   console.log('Fixed missing custom duties in matrix');
} else {
   console.log('Could not find replace block');
}


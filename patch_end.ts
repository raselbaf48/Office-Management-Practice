import fs from 'fs';

let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

const brokenEnd = `          })}
      </div>
      
      </div>

      {/* Calendar Edit Modal */}`;

const fixedEnd = `          })}
      </div>
      
      </div>
      )}

      {/* Calendar Edit Modal */}`;

code = code.replace(brokenEnd, fixedEnd);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);

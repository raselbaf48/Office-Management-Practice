const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf-8');

const replacement = `
        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
          {(role === 'ADMIN' || role === 'SUPER_ADMIN') ? (
            <>
              <button
                onClick={() => setIsImportModalOpen(true)}
`;

code = code.replace(
  `        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
          <button
              onClick={() => setIsImportModalOpen(true)}`,
  replacement
);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);

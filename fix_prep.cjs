const fs = require('fs');
let file = fs.readFileSync('src/components/FlyingWingStateView.tsx', 'utf-8');

const oldPrep = `<div className="w-full mt-16 mb-4 flex justify-start text-xs">
        <div className="text-center min-w-[150px]">
          <div className="mb-10 font-normal text-left">Prepared By</div>
          <div className="text-left">
            <div className="text-xs uppercase font-black">{preparedBy.name}</div>
            <div className="text-[11px] font-bold uppercase">{preparedBy.rank}</div>
            <div className="text-[11px] font-normal">{preparedBy.designation}</div>
          </div>
        </div>
      </div>`;

const newPrep = `<div className="w-full mt-16 mb-4 flex justify-start text-xs">
        <div className="flex flex-col items-start">
          <div className="mb-10 font-normal">Prepared By</div>
          <div className="text-left">
            <div className="text-xs uppercase font-black">{preparedBy.name}</div>
            <div className="text-[11px] font-bold uppercase">{preparedBy.rank}</div>
            <div className="text-[11px] font-normal">{preparedBy.designation}</div>
          </div>
        </div>
      </div>`;

file = file.replace(oldPrep, newPrep);
fs.writeFileSync('src/components/FlyingWingStateView.tsx', file, 'utf-8');

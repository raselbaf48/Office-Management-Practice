const fs = require('fs');
let code = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

// The headers start with 'Unit' (wait, no, it's <th> tags)
const searchHeaders = `                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)]">Det/ Tdy</div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)]">Eff Str</div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)]">Leave</div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)]">Essn</div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)]">CMH</div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px]">Sick Report</div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px]">Drill Cat-C</div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px]">Guard Duty On/Off</div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px]">Bake & Bite</div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px]">K/O & Reception</div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px]">Admin Order</div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px]">Class/ Trg</div>
                    </th>
                      <th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          Air Fd Duty
                        </div>
                      </th>`;

const newHeaders = `                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)]">Eff Str</div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)]">Leave</div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)]">Essn</div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)]">CMH/BNS/BSH</div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px]">Sick Report</div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px]">Drill Cat-C</div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px]">Guard Duty On/Off</div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px]">Canteen</div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px]">Bake & Bite</div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px]">K/O & Reception</div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px]">Guard of Honour</div>
                    </th>`;

if (code.includes(searchHeaders)) {
  code = code.replace(searchHeaders, newHeaders);
  fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', code);
  console.log('Replaced headers successfully');
} else {
  console.log('Search headers not found in PrintableParadeStateModal.tsx');
}

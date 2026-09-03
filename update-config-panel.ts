import fs from 'fs';

let code = fs.readFileSync('src/components/DutyRatioConfigPanel.tsx', 'utf8');

// Add interface and update component signature
const signatureToReplace = "export const DutyRatioConfigPanel: React.FC = () => {";
const newSignature = `export interface DutyRatioConfigPanelProps {
  activeTab?: 'DUTY_DISTRIBUTION' | 'MANPOWER' | 'TOTAL_DUTY';
}

export const DutyRatioConfigPanel: React.FC<DutyRatioConfigPanelProps> = ({ activeTab }) => {`;

code = code.replace(signatureToReplace, newSignature);

// Wrap sections in activeTab checks

// 1. Total Duty Table
// It starts right after:
// <div className="text-center font-bold mb-4">
//   <div className="underline text-base">All Duties</div>
//   <div className="underline text-base">155 UASU BAF</div>
// </div>
// <div className="flex flex-col lg:flex-row gap-8 mb-8 items-start justify-center">

// We need to wrap the Total Duty table.
// The Total Duty table is the first child of the flex container.
// The Effective Manpower table is the second child.

// Actually, instead of replacing via regex, let's just make the changes safely by using the known structure.

code = code.replace(
  `{/* TOTAL DUTY */}`,
  `{(!activeTab || activeTab === 'TOTAL_DUTY') && (\n        {/* TOTAL DUTY */}`
);

// We need to close the wrap after the TOTAL DUTY div. The TOTAL DUTY div ends before `{/* EFFECTIVE MANPOWER */}`.
code = code.replace(
  `{/* EFFECTIVE MANPOWER */}`,
  `)}\n        {/* EFFECTIVE MANPOWER */}`
);

code = code.replace(
  `{/* EFFECTIVE MANPOWER */}`,
  `{(!activeTab || activeTab === 'MANPOWER') && (\n        {/* EFFECTIVE MANPOWER */}`
);

// Close the wrap after EFFECTIVE MANPOWER. It ends before `</div>\n\n      {/* DISTRIBUTION AS PER MANPOWER */}`
code = code.replace(
  `</div>\n\n      {/* DISTRIBUTION AS PER MANPOWER */}`,
  `)}\n      </div>\n\n      {(!activeTab || activeTab === 'DUTY_DISTRIBUTION') && (\n        <>\n      {/* DISTRIBUTION AS PER MANPOWER */}`
);

// Close the final wrap at the end before the last closing divs.
// The file ends with:
//       </div>
//     </div>
//   );
// };
code = code.replace(
  `        </table>\n      </div>\n    </div>\n  );\n};`,
  `        </table>\n      </div>\n      </>\n      )}\n    </div>\n  );\n};`
);

fs.writeFileSync('src/components/DutyRatioConfigPanel.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioConfigPanel.tsx', 'utf-8');

const propsStr = `export interface DutyRatioConfigPanelProps {
  matrix?: DutyRatioTable[];
  onMatrixChange?: (newMatrix: DutyRatioTable[]) => void;
  activeTab?: 'DUTY_DISTRIBUTION' | 'MANPOWER' | 'DUTY_LIST';
}`;
const newPropsStr = `export interface DutyRatioConfigPanelProps {
  matrix?: DutyRatioTable[];
  onMatrixChange?: (newMatrix: DutyRatioTable[]) => void;
  activeTab?: 'DUTY_DISTRIBUTION' | 'MANPOWER' | 'DUTY_LIST';
  targetDate?: string;
}`;

code = code.replace(propsStr, newPropsStr);

const compDefStr = `export const DutyRatioConfigPanel: React.FC<DutyRatioConfigPanelProps> = ({ activeTab, matrix, onMatrixChange }) => {`;
const newCompDefStr = `export const DutyRatioConfigPanel: React.FC<DutyRatioConfigPanelProps> = ({ activeTab, matrix, onMatrixChange, targetDate }) => {`;

code = code.replace(compDefStr, newCompDefStr);

fs.writeFileSync('src/components/DutyRatioConfigPanel.tsx', code);

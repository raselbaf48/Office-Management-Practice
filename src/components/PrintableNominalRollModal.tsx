import React from 'react';
import { Airman } from '../types';
import { Printer, X, Download } from 'lucide-react';
import { exportNominalRollDocx } from '../utils/docxExport';
import { getSavedPreparedBy, getSavedAuthorizedBy } from './SignatureConfigModal';

interface PrintableNominalRollModalProps {
  airmen: Airman[];
  title?: string;
  onClose: () => void;
}

export const PrintableNominalRollModal: React.FC<PrintableNominalRollModalProps> = ({
  airmen,
  title = "OFFICIAL NOMINAL ROLL : 155 UASU BAF",
  onClose,
}) => {
  const preparedBy = getSavedPreparedBy();
  const authorizedBy = getSavedAuthorizedBy();

  const getPdfTitle = () => `Nominal_Roll_${new Date().toISOString().split('T')[0]}.pdf`;

  const handlePrint = () => {
    document.title = getPdfTitle();
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-100 print:bg-white animate-fadeIn print:static print:block print:h-auto print:overflow-visible text-black">
      {/* Top Header Controls (Hidden on Print) */}
      <div className="flex-none bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between shadow-2xl print:hidden z-10">
        <div className="flex items-center space-x-3 text-white">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-black tracking-widest">
              OFFICIAL NOMINAL ROLL PRINT PREVIEW
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              Use 'Save as PDF' or Print directly
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => exportNominalRollDocx(airmen)}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export DOCX</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-sm shadow-lg shadow-emerald-900/20 transition-all cursor-pointer"
          >
            <Printer className="w-5 h-5" />
            <span>Official Export / Print</span>
          </button>
        </div>
      </div>

      {/* Printable Content Area */}
      <div className="flex-1 overflow-auto print:overflow-visible bg-slate-200/50 print:bg-white p-4 sm:py-8 print:p-0 flex justify-start sm:justify-center print:block">
        <div className="w-max sm:w-[210mm] min-w-[min(100vw-32px,210mm)] h-fit min-h-[297mm] print:w-full print:min-h-0 print:h-auto shrink-0 bg-white text-black print:shadow-none print:border-none border border-slate-300 shadow-2xl p-4 sm:p-12 print:p-0 print:m-0">
          <div className="w-full">
            {/* Document Header */}
            <div className="text-center mb-6">
              <h1 className="text-base font-black underline leading-snug">
                NOMINAL ROLL : AIRMEN<br />
                155 UASU BAF
              </h1>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto print:overflow-visible flex justify-center print:block">
              <table className="no-zebra w-full text-left text-[12px] border-collapse border border-black font-sans" style={{ pageBreakInside: 'auto' }}>
                <thead className="bg-slate-100 print:bg-white text-black" style={{ backgroundColor: '#f1f5f9', color: '#000000', display: 'table-header-group' }}>
                  <tr>
                    <th className="p-1.5 border border-black font-bold text-center w-8">Ser</th>
                    <th className="p-1.5 border border-black font-bold text-center">BD No</th>
                    <th className="p-1.5 border border-black font-bold text-center">Rank</th>
                    <th className="p-1.5 border border-black font-bold text-center w-48">Name</th>
                    <th className="p-1.5 border border-black font-bold text-center">Trade</th>
                    <th className="p-1.5 border border-black font-bold text-center">Flight</th>
                    <th className="p-1.5 border border-black font-bold text-center">Address</th>
                    <th className="p-1.5 border border-black font-bold text-center">Mobile No</th>
                  </tr>
                </thead>
                <tbody style={{ display: 'table-row-group' }}>
                  {airmen.map((airman, idx) => (
                    <tr key={airman.id} className="even:bg-gray-100 print:even:bg-gray-100" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
                      <td className="p-1.5 border border-black text-center">
                        {idx + 1}
                      </td>
                      <td className="p-1.5 border border-black text-center">
                        {airman.bdNo.replace(/^BD\//i, '')}
                      </td>
                      <td className="p-1.5 border border-black text-center">
                        {airman.rank}
                      </td>
                      <td className="p-1.5 border border-black text-left">
                        {airman.name}
                      </td>
                      <td className="p-1.5 border border-black text-left">
                        {airman.trade}
                      </td>
                      <td className="p-1.5 border border-black text-left">
                        {airman.flightName}
                      </td>
                      <td className="p-1.5 border border-black text-left">
                        {airman.addressBlock || '-'}
                      </td>
                      <td className="p-1.5 border border-black text-center">
                        {airman.mobileNo || '-'}
                      </td>
                    </tr>
                  ))}
                  {airmen.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-slate-500 font-medium">
                        No airmen found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

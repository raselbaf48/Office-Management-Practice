const fs = require('fs');
let file = fs.readFileSync('src/components/NightCountStateView.tsx', 'utf-8');

const signatureModalStr = `      {/* Signature Configuration Modal (Prepared By / Authorized By) */}`;

const modelsToInject = `      {showFlgWgHistory && (
        <FlgWgHistoryModal 
          onClose={() => setShowFlgWgHistory(false)}
          onSelectDate={(newDate) => {
            setFromDate(newDate);
            setToDate(newDate);
            setSelectedDate(newDate);
          }}
        />
      )}

      {isFlgWgPrintOpen && (
        <PrintableFlyingWingModal
          date={fromDate}
          uasuStats={{
            totalStr: getFlightStats('Overall').totalStr,
            detTdy: getFlightStats('Overall').detTdyCount,
            leave: getFlightStats('Overall').leaveCount,
            edEx: getFlightStats('Overall').sickExCount,
            cmh: getFlightStats('Overall').hospitalCount,
            office: getFlightStats('Overall').othersCount,
            baseAirfield: getFlightStats('Overall').airFdDutyCount,
            driving: 0
          }}
          onClose={() => setIsFlgWgPrintOpen(false)}
        />
      )}

      {/* Signature Configuration Modal (Prepared By / Authorized By) */}`;

if (!file.includes('<PrintableFlyingWingModal')) {
    file = file.replace(signatureModalStr, modelsToInject);
}

fs.writeFileSync('src/components/NightCountStateView.tsx', file, 'utf-8');

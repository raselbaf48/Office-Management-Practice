const fs = require('fs');
let file = fs.readFileSync('src/components/NightCountStateView.tsx', 'utf-8');

const oldUsage = `<FlyingWingStateView 
            isAddModalOpen={showFlyingWingAdd}
            onCloseAddModal={() => setShowFlyingWingAdd(false)}
            onOpenAddModal={() => setShowFlyingWingAdd(true)}
            date={fromDate}`;

const newUsage = `<FlyingWingStateView 
            isAddModalOpen={showFlyingWingAdd}
            onCloseAddModal={() => setShowFlyingWingAdd(false)}
            onOpenAddModal={() => setShowFlyingWingAdd(true)}
            isPrepModalOpen={showFlyingWingPrep}
            onClosePrepModal={() => setShowFlyingWingPrep(false)}
            date={fromDate}`;

file = file.replace(oldUsage, newUsage);

// Add the PrintableFlyingWingModal at the end
const oldEnd = `{isInternalPrintOpen && singleParadeData && (
        <PrintableNightCountModal
          date={singleParadeData.date}
          paradeState={singleParadeData}
          onClose={() => setIsInternalPrintOpen(false)}
          preparedBy={preparedBy}
          authorizedBy={authorizedBy}
          isPtDocument={isPtDocument}
        />
      )}`;

const newEnd = `{isInternalPrintOpen && singleParadeData && (
        <PrintableNightCountModal
          date={singleParadeData.date}
          paradeState={singleParadeData}
          onClose={() => setIsInternalPrintOpen(false)}
          preparedBy={preparedBy}
          authorizedBy={authorizedBy}
          isPtDocument={isPtDocument}
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
      )}`;

file = file.replace(oldEnd, newEnd);
fs.writeFileSync('src/components/NightCountStateView.tsx', file, 'utf-8');

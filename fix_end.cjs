const fs = require('fs');
const file = 'src/components/AssignDutyModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `      {/* Flight Duty Ratio Modal */}
      {showRatioModal && (
        <FlightDutyRatioModal
          airmen={airmen}
          isOpen={showRatioModal}
          onClose={() => setShowRatioModal(false)}
          selectedDate={fromDate}
          onRatioUpdated={() => {
            fetchCurrentRoster();
          }}
        />
      )}
    </div>
  );
};`;

const replacement = `      {/* Flight Duty Ratio Modal */}
      {showRatioModal && (
        <FlightDutyRatioModal
          airmen={airmen}
          isOpen={showRatioModal}
          onClose={() => setShowRatioModal(false)}
          selectedDate={fromDate}
          onRatioUpdated={() => {
            fetchCurrentRoster();
          }}
        />
      )}
      </div>
    </div>
  );
};`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacement);
  fs.writeFileSync(file, content);
  console.log("Fixed closing div");
} else {
  console.log("Target string not found at the end.");
}

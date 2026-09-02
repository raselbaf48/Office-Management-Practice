import fs from 'fs';
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

// I will just find `{matrix.map(` and trace the divs manually, 
// but wait, I can just use a regex to replace everything from `          })}\n      </div>` down to the end of the file.

const splitPoint = "            );\n          })}\n      </div>";
const parts = code.split(splitPoint);

if (parts.length === 2) {
  const newEnd = `
        </div>
      </div>

      {/* Calendar Edit Modal */}
      {editingCalendar && (role === 'ADMIN' || role === 'SUPER_ADMIN') && (
        <FlightDutyCalendarModal
          table={matrix[editingCalendar.tableIdx]}
          flight={editingCalendar.flight}
          onClose={() => setEditingCalendar(null)}
          onSave={(newData) => {
            const updated = [...matrix];
            updated[editingCalendar.tableIdx].data[editingCalendar.flight] = newData;
            setMatrix(updated);
            setIsSaved(false);
            setEditingCalendar(null);
          }}
        />
      )}
    </div>
  );
};
`;
  code = parts[0] + splitPoint + newEnd;
  fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
  console.log("Fixed");
} else {
  console.log("Split point not found");
}

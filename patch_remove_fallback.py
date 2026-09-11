import sys

with open('src/components/AssignDutyModal.tsx', 'r') as f:
    code = f.read()

target = """      // If all quotas are fulfilled, fallback to the first flight that has a quota
      if (targetFlight === "All") {
        for (const flt of orderedFlights) {
          const required = getFlightDutyQuotaForDate(
            fromDate, 
            flt, 
            activeDutyCode,
            (activeDutyCode === "IDAC" || activeDutyCode === "IDA") ? activeIdaShift : undefined
          );
          if (required > 0) {
            targetFlight = flt;
            break;
          }
        }
      }"""

replacement = """      // If all quotas are fulfilled, targetFlight remains "All" """

if target in code:
    code = code.replace(target, replacement)
    print("Replaced!")
else:
    print("Target not found!")

with open('src/components/AssignDutyModal.tsx', 'w') as f:
    f.write(code)


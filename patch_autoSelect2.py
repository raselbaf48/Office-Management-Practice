import sys

with open('src/components/AssignDutyModal.tsx', 'r') as f:
    code = f.read()

target = "      setActiveFlight(targetFlight);\n    }\n  }, [activeDutyCode, fromDate, activeIdaShift, assignmentsList, airmanMap]);"

replacement = """      // If all quotas are fulfilled, fallback to the first flight that has a quota
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
      }
      
      setActiveFlight(targetFlight);
    }
  }, [activeDutyCode, fromDate, activeIdaShift, assignmentsList, airmanMap]);"""

if target in code:
    code = code.replace(target, replacement)
    print('Replaced target!')
else:
    print('Target not found!')

with open('src/components/AssignDutyModal.tsx', 'w') as f:
    f.write(code)


import re

file_path = 'src/components/AssignDutyModal.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace getRequiredCountForDuty
old_func = """  // Helper to get required ratio count for duty
  const getRequiredCountForDuty = (dutyCode: DutyCategoryCode, shift?: IDAShift): number => {
    const flights: FlightName[] = ['Mechanics', 'Avionics', 'GCS', 'Admin'];
    if (activeFlight === 'All') {"""

new_func = """  // Helper to get required ratio count for duty
  const getRequiredCountForDuty = (dutyCode: DutyCategoryCode, shift?: IDAShift, specificFlight?: FlightName | 'All'): number => {
    const flights: FlightName[] = ['Mechanics', 'Avionics', 'GCS', 'Admin'];
    const targetFlight = specificFlight !== undefined ? specificFlight : activeFlight;
    if (targetFlight === 'All') {"""

content = content.replace(old_func, new_func)

# Replace activeFlight with targetFlight inside the function
old_inside = """    if (dutyCode === 'IDAC' || dutyCode === 'IDA') {
      if (shift) {
        return getFlightDutyQuotaForDate(fromDate, activeFlight, 'IDAC', shift);
      }
      const shifts: IDAShift[] = ['Morning', 'Afternoon', 'Night'];
      return shifts.reduce((sSum, sh) => sSum + getFlightDutyQuotaForDate(fromDate, activeFlight, 'IDAC', sh), 0);
    }
    return getFlightDutyQuotaForDate(fromDate, activeFlight, dutyCode);"""

new_inside = """    if (dutyCode === 'IDAC' || dutyCode === 'IDA') {
      if (shift) {
        return getFlightDutyQuotaForDate(fromDate, targetFlight as FlightName, 'IDAC', shift);
      }
      const shifts: IDAShift[] = ['Morning', 'Afternoon', 'Night'];
      return shifts.reduce((sSum, sh) => sSum + getFlightDutyQuotaForDate(fromDate, targetFlight as FlightName, 'IDAC', sh), 0);
    }
    return getFlightDutyQuotaForDate(fromDate, targetFlight as FlightName, dutyCode);"""

content = content.replace(old_inside, new_inside)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

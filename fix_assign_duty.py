import re

file_path = 'src/components/AssignDutyModal.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Change activeDutyCode initialization
content = content.replace(
    """  const [activeDutyCode, setActiveDutyCode] = useState<DutyCategoryCode>(
    onlyIdac ? 'IDAC' : (initialDutyCode || 'GD')
  );""",
    """  const [activeDutyCode, setActiveDutyCode] = useState<DutyCategoryCode | ''>(
    onlyIdac ? 'IDAC' : (initialDutyCode || '')
  );
  const [selectionMode, setSelectionMode] = useState<'DutyFirst' | 'FlightFirst' | 'None'>(
    initialDutyCode ? 'DutyFirst' : (initialFlight !== 'All' ? 'FlightFirst' : 'None')
  );"""
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

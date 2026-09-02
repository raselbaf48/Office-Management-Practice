import re

with open('src/components/PrintableParadeStateModal.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "const [selectedFlight, setSelectedFlight] = useState<FlightName | 'Overall'>('Overall');",
    "const [selectedFlight, setSelectedFlight] = useState<FlightName | 'Overall'>('Overall');\n  const [hideEmptyColumns, setHideEmptyColumns] = useState<boolean>(false);"
)

with open('src/components/PrintableParadeStateModal.tsx', 'w') as f:
    f.write(content)

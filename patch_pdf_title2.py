import os
import re

file_path = 'src/components/NightCountStateView.tsx'
with open(file_path, 'r') as f:
    code = f.read()

# Add getPdfTitle and useEffect for document.title right after formatDateShort
code = code.replace(
    "  const formatDateShort = (dStr: string) => {",
    """  const getPdfTitle = () => {
    const formattedDate = formatDateShort(selectedDate);
    return `Night Count State - 155 UASU BAF (${formattedDate})`;
  };

  useEffect(() => {
    const originalTitle = document.title;
    document.title = getPdfTitle();
    
    const handleBeforePrint = () => {
      document.title = getPdfTitle();
    };
    
    window.addEventListener('beforeprint', handleBeforePrint);
    
    return () => {
      document.title = originalTitle;
      window.removeEventListener('beforeprint', handleBeforePrint);
    };
  }, [selectedDate]);

  const formatDateShort = (dStr: string) => {"""
)

# Replace window.print() calls
code = code.replace(
    "window.print();",
    "document.title = getPdfTitle(); window.print();"
)

with open(file_path, 'w') as f:
    f.write(code)

print("Title patch applied to NightCountStateView")

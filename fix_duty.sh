awk '
  /<\/div>/ {
    prev_line = $0
    next
  }
  /{isPrintModalOpen && \(/ {
    if (prev_line != "") {
      # Do not print the previous </div> line
      prev_line = ""
    }
    print $0
    next
  }
  {
    if (prev_line != "") {
      print prev_line
      prev_line = ""
    }
    print $0
  }
  END {
    if (prev_line != "") {
      print prev_line
    }
  }
' src/components/DutyRatioMatrixView.tsx > temp.tsx && mv temp.tsx src/components/DutyRatioMatrixView.tsx

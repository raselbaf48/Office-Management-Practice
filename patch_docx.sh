sed -i "s/createArialHeaderCell('Mobile No', 1500),/createArialHeaderCell('Contact', 1500),\n      createArialHeaderCell('Status', 1200),/" src/utils/docxExport.ts

sed -i 's/createArialDataCell(a.mobileNo || '"'-'"', 1500, AlignmentType.CENTER),/createArialDataCell(a.mobileNo || '"'-'"', 1500, AlignmentType.CENTER),\n        createArialDataCell(a.active !== false ? '"'Active'"' : (a.leaveReason || '"'Inactive'"'), 1200, AlignmentType.CENTER),/' src/utils/docxExport.ts

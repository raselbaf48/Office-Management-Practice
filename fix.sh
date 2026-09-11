sed -i 's/if (!table) return 0;/if (!table || table.isDisabled) return 0;/' src/data/officialDutyRatioMatrix.ts
sed -i 's/if (!table) return \[\];/if (!table || table.isDisabled) return \[\];/' src/data/officialDutyRatioMatrix.ts

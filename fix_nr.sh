sed -i '/{isPrintModalOpen /d' src/components/NominalRoll.tsx
sed -i '/{isPrintModalOpen && (/d' src/components/NominalRoll.tsx
sed -i '/<PrintableNominalRollModal/i \      {isPrintModalOpen && (' src/components/NominalRoll.tsx

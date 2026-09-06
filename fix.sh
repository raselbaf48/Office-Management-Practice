sed -i '/{isPrintModalOpen /d' src/components/DutyRatioMatrixView.tsx
sed -i '/{isPrintModalOpen && (/d' src/components/DutyRatioMatrixView.tsx
sed -i '/<PrintableDutyRatioModal/i \      {isPrintModalOpen && (' src/components/DutyRatioMatrixView.tsx

sed -i 's/    <div className="space-y-6">/    <div className="space-y-6">\n      <div className={isPrintModalOpen ? "hidden" : "space-y-6 print:hidden"}>/' src/components/NominalRoll.tsx

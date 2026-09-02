sed -i 's/<div className="flex-1 overflow-y-auto px-4 pb-6 space-y-1">/<div className="flex overflow-x-auto sm:flex-col sm:overflow-y-auto sm:flex-1 px-4 pb-4 sm:pb-6 gap-2 sm:gap-1 sm:space-y-1 scrollbar-hide">/g' src/components/SettingsModal.tsx
sed -i "s/className=\`w-full flex items-center/className=\`w-auto sm:w-full shrink-0 flex items-center/g" src/components/SettingsModal.tsx

# Sidebar
sed -i 's/Attachment Register (Outstation & Bake N Bite)/Deployment Register (Bake N Bite, Canteen, Custom)/g' src/components/Sidebar.tsx
sed -i 's/Attachment Register/Deployment Register/g' src/components/Sidebar.tsx

# TopHeader
sed -i 's/Attachment Register/Deployment Register/g' src/components/TopHeader.tsx

# App
sed -i 's/AttachmentRegisterView/DeploymentRegisterView/g' src/App.tsx
mv src/components/AttachmentRegisterView.tsx src/components/DeploymentRegisterView.tsx

# DeploymentRegisterView
sed -i 's/AttachmentRegisterView/DeploymentRegisterView/g' src/components/DeploymentRegisterView.tsx
sed -i 's/Attachment Register/Deployment Register/g' src/components/DeploymentRegisterView.tsx
sed -i 's/Attachment/Deployment/g' src/components/DeploymentRegisterView.tsx
sed -i 's/attachment/deployment/g' src/components/DeploymentRegisterView.tsx

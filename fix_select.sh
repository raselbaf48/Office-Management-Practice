sed -i '/<option value="BAF BSR">BAF BSR<\/option>/d' src/components/DeploymentRegisterView.tsx
sed -i '/<option value="BAF ZHR">BAF ZHR<\/option>/d' src/components/DeploymentRegisterView.tsx
sed -i '/<option value="BAF MTR">BAF MTR<\/option>/d' src/components/DeploymentRegisterView.tsx
sed -i '/<option value="BAF PKP">BAF PKP<\/option>/d' src/components/DeploymentRegisterView.tsx
sed -i '/<option value="BAF BBD">BAF BBD<\/option>/d' src/components/DeploymentRegisterView.tsx
sed -i '/<option value="BAF CXB">BAF CXB<\/option>/d' src/components/DeploymentRegisterView.tsx
sed -i '/<option value="BAF SMD">BAF SMD<\/option>/d' src/components/DeploymentRegisterView.tsx
sed -i 's/<option value="Bake N Bite">Bake N Bite<\/option>/<option value="Bake N Bite">Bake \& Bite<\/option>/g' src/components/DeploymentRegisterView.tsx
sed -i 's/<option value="Custom">Other Custom...<\/option>/<option value="Custom">Custom (Type manually...)<\/option>/g' src/components/DeploymentRegisterView.tsx

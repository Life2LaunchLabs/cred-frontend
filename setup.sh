#!/bin/bash

set -e  # Exit on error

echo "🚀 Starting cred-frontend setup..."

# Check if nvm is installed
if ! command -v nvm &> /dev/null; then
    echo "📦 Installing nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

    # Load nvm into current shell
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
else
    echo "✅ nvm is already installed"
    # Load nvm
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# Install Node.js LTS
echo "📦 Installing Node.js LTS..."
nvm install --lts
nvm use --lts

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install project dependencies
echo "📦 Installing project dependencies (Material UI, Emotion, MUI-X, React Router, etc.)..."
npm install

# Create .env with default spec tag if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env with default SPEC_TAG..."
    echo "SPEC_TAG=V0.0.0" > .env
fi

# Pull API spec and generate TypeScript client
echo "📦 Pulling API spec and generating TypeScript client..."
npm run api:update

echo ""
echo "✨ Setup complete! You can now run:"
echo "   npm run dev    - Start development server"
echo "   npm run build  - Build for production"
echo "   npm run start  - Start production server"

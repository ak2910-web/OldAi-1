#!/bin/bash

# ========== CONFIG ==========
# Set your production Firebase project ID here
PROD_PROJECT="your-prod-project-id"

# ========== START SCRIPT ==========
echo "🚀 Starting Firebase Functions Deployment..."

# Show API key if running emulators
if [[ "$1" == "emulators" ]]; then
	if [ -f ".env" ]; then
		source .env
		echo "🔑 GOOGLE_API_KEY loaded: $GOOGLE_API_KEY"
	else
		echo "⚠️  .env file not found. GOOGLE_API_KEY not loaded."
	fi
	firebase emulators:start
	exit 0
fi

# Confirm .env exists
if [ ! -f ".env" ]; then
	echo "❌ ERROR: .env file not found!"
	echo "Create .env with: GOOGLE_API_KEY=your_key"
	exit 1
fi

echo "🔐 .env file found."

# Ask before deployment (safety)
read -p "⚠️ Are you sure you want to deploy to PRODUCTION ($PROD_PROJECT)? (y/N): " confirm
if [[ "$confirm" != "y" ]]; then
	echo "❌ Deployment cancelled."
	exit 0
fi

echo "📦 Installing dependencies..."
npm install --prefix functions

echo "🚀 Deploying Cloud Functions to Firebase production project..."
firebase deploy --only functions --project="$PROD_PROJECT"

echo "🎉 Deployment complete!"

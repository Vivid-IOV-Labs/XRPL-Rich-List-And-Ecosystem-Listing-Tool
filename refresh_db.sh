#!/bin/sh

echo "Running your scripts..."

export PATH="$PATH:/home/ubuntu/.nvm/versions/node/v16.18.1/bin"

# Run the fetch:ledger-data command
npm run fetch:ledger-data

# Run the calculate:percents command
npm run calculate:percents

# Run the calculate:nftAnalytics command
npm run calculate:nftAnalytics

echo "Scripts ran successfully!"

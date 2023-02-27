#!/bin/sh

echo "Running your scripts..."

yarn fetch:ledger-data
yarn calculate:percents
yarn calculate:nftAnalytics

echo "Scripts ran successfully!"
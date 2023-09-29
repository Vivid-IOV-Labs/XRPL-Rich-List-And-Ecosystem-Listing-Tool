#!/bin/sh

# Create a variable to hold the log file path
LOG_FILE="./logs/cron.log"

echo "Running your scripts..." >> $LOG_FILE

# Clear the log file before appending new details
echo "Clearing log file..."
> $LOG_FILE

export PATH="$PATH:/home/ubuntu/.nvm/versions/node/v16.18.1/bin"

# Run the fetch:ledger-data command
echo "Running fetch:ledger-data..." >> $LOG_FILE
npm run fetch:ledger-data >> $LOG_FILE 2>&1

# Run the update:trackedProjects command
echo "Running update:trackedProjects..." >> $LOG_FILE
npm run update:trackedProjects >> $LOG_FILE 2>&1

# Run the calculate:percents command
echo "Running calculate:percents..." >> $LOG_FILE
npm run calculate:percents >> $LOG_FILE 2>&1

# Run calculate:nftAnalytics command
echo "Running calculate:nftAnalytics..." >> $LOG_FILE
npm run calculate:nftAnalytics >> $LOG_FILE 2>&1

echo "Scripts ran successfully!" >> $LOG_FILE

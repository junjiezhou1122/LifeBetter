#!/bin/bash
# Script to generate daily English learning report

cd /Users/junjie/research/LifeBetter/english_learning/

# Generate today's report
python3 -c "
import sys
sys.path.append('.')
from log_manager import generate_daily_report
print(generate_daily_report())
" > daily_reports/$(date +%Y-%m-%d)_report.md

echo "Daily report generated: /Users/junjie/research/LifeBetter/english_learning/daily_reports/$(date +%Y-%m-%d)_report.md"
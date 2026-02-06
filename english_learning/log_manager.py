#!/usr/bin/env python3
"""
Manager for English learning error logs
"""

import json
import datetime
from typing import Dict, Any

def load_error_log() -> Dict[str, Any]:
    """Load the current error log from file"""
    log_path = '/Users/junjie/research/LifeBetter/english_learning/error_log.json'
    try:
        with open(log_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        # Return default structure if file doesn't exist
        return {
            "learning_start_date": str(datetime.date.today()),
            "total_errors": 0,
            "error_categories": {},
            "daily_summaries": {},
            "error_entries": []
        }

def save_error_log(log_data: Dict[str, Any]) -> None:
    """Save the error log to file"""
    log_path = '/Users/junjie/research/LifeBetter/english_learning/error_log.json'
    with open(log_path, 'w', encoding='utf-8') as f:
        json.dump(log_data, f, ensure_ascii=False, indent=2)

def add_error_entry(original_text: str, corrected_text: str, error_category: str, explanation: str) -> None:
    """Add a new error entry to the log"""
    log_data = load_error_log()
    
    entry = {
        "timestamp": datetime.datetime.now().isoformat(),
        "original_text": original_text,
        "corrected_text": corrected_text,
        "category": error_category,
        "explanation": explanation
    }
    
    log_data["error_entries"].append(entry)
    log_data["total_errors"] += 1
    
    # Update category count
    if error_category not in log_data["error_categories"]:
        log_data["error_categories"][error_category] = 0
    log_data["error_categories"][error_category] += 1
    
    # Group by date for potential daily summaries
    date_str = datetime.date.today().strftime("%Y-%m-%d")
    if date_str not in log_data["daily_summaries"]:
        log_data["daily_summaries"][date_str] = []
    log_data["daily_summaries"][date_str].append(entry)
    
    save_error_log(log_data)

def generate_daily_report(date: str = None) -> str:
    """Generate a daily report for a specific date (or today if not specified)"""
    if date is None:
        date = datetime.date.today().strftime("%Y-%m-%d")
    
    log_data = load_error_log()
    
    if date not in log_data["daily_summaries"]:
        return f"No errors recorded for {date}"
    
    entries = log_data["daily_summaries"][date]
    categories_count = {}
    
    for entry in entries:
        cat = entry["category"]
        categories_count[cat] = categories_count.get(cat, 0) + 1
    
    report = f"English Learning Report - {date}\n"
    report += "="*40 + "\n"
    report += f"Total errors today: {len(entries)}\n\n"
    report += "Error breakdown by category:\n"
    
    for category, count in categories_count.items():
        report += f"- {category}: {count} occurrence(s)\n"
    
    report += "\nDetailed errors:\n"
    for i, entry in enumerate(entries, 1):
        report += f"\n{i}. Original: {entry['original_text']}\n"
        report += f"   Corrected: {entry['corrected_text']}\n"
        report += f"   Explanation: {entry['explanation']}\n"
    
    return report

if __name__ == "__main__":
    print("English Learning Log Manager")
    print("Use this module to manage error logs and generate reports.")
#!/usr/bin/env python3
"""
Initialization script for English learning tracking
"""

import json
import os
from datetime import datetime

def init_english_learning():
    """
    Initialize or resume English learning tracking
    """
    log_path = "/Users/junjie/research/LifeBetter/english_learning/error_log.json"
    
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(log_path), exist_ok=True)
    
    # Check if log file exists
    if os.path.exists(log_path):
        with open(log_path, 'r', encoding='utf-8') as f:
            try:
                log_data = json.load(f)
                print(f"Resumed English learning tracking. Current total errors: {log_data.get('total_errors', 0)}")
                print(f"Learning since: {log_data.get('learning_start_date', 'unknown')}")
                
                # Show today's progress
                today = datetime.now().strftime("%Y-%m-%d")
                if today in log_data.get("daily_summaries", {}):
                    today_count = len(log_data["daily_summaries"][today])
                    print(f"Errors recorded today: {today_count}")
                else:
                    print("No errors recorded yet today")
                    
                return log_data
            except json.JSONDecodeError:
                print("Error reading log file, creating new one")
                return create_new_log(log_path)
    else:
        return create_new_log(log_path)

def create_new_log(path):
    """
    Create a new error log
    """
    log_data = {
        "learning_start_date": datetime.now().strftime("%Y-%m-%d"),
        "total_errors": 0,
        "error_categories": {},
        "daily_summaries": {},
        "error_entries": []
    }
    
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(log_data, f, ensure_ascii=False, indent=2)
    
    print("Started new English learning tracking session")
    return log_data

def add_error(original_text, corrected_text, category, explanation):
    """
    Add an error to the log
    """
    log_path = "/Users/junjie/research/LifeBetter/english_learning/error_log.json"
    
    with open(log_path, 'r', encoding='utf-8') as f:
        log_data = json.load(f)
    
    entry = {
        "timestamp": datetime.now().isoformat(),
        "original_text": original_text,
        "corrected_text": corrected_text,
        "category": category,
        "explanation": explanation
    }
    
    log_data["error_entries"].append(entry)
    log_data["total_errors"] += 1
    
    # Update category count
    if category not in log_data["error_categories"]:
        log_data["error_categories"][category] = 0
    log_data["error_categories"][category] += 1
    
    # Group by date for daily summaries
    date_str = datetime.now().strftime("%Y-%m-%d")
    if date_str not in log_data["daily_summaries"]:
        log_data["daily_summaries"][date_str] = []
    log_data["daily_summaries"][date_str].append(entry)
    
    with open(log_path, 'w', encoding='utf-8') as f:
        json.dump(log_data, f, ensure_ascii=False, indent=2)
    
    print(f"Recorded error in category '{category}'. Total errors now: {log_data['total_errors']}")

if __name__ == "__main__":
    init_english_learning()
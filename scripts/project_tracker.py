#!/usr/bin/env python3
"""
Project tracker for the LifeBetter Meta-Learning System
"""

import json
import os
from datetime import datetime
from pathlib import Path


class ProjectTracker:
    """Tracks progress and tasks for the LifeBetter project"""
    
    def __init__(self, project_dir):
        """Initialize the project tracker"""
        self.project_dir = Path(project_dir).expanduser()
        self.tracker_file = self.project_dir / "memory" / "project_tracker.json"
        
        # Create memory directory if it doesn't exist
        self.tracker_file.parent.mkdir(exist_ok=True)
        
        # Load existing tracker data or initialize
        if self.tracker_file.exists():
            with open(self.tracker_file, 'r') as f:
                self.data = json.load(f)
        else:
            self.data = {
                "created_at": datetime.now().isoformat(),
                "tasks": [],
                "milestones": [],
                "progress_log": []
            }
    
    def add_task(self, title, description="", priority="medium", status="todo"):
        """Add a new task to the project"""
        task = {
            "id": len(self.data["tasks"]) + 1,
            "title": title,
            "description": description,
            "priority": priority,  # low, medium, high
            "status": status,      # todo, in_progress, done
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        self.data["tasks"].append(task)
        self.save()
        return task
    
    def update_task_status(self, task_id, status):
        """Update the status of a task"""
        for task in self.data["tasks"]:
            if task["id"] == task_id:
                task["status"] = status
                task["updated_at"] = datetime.now().isoformat()
                self.save()
                return True
        return False
    
    def add_milestone(self, title, description="", target_date=None):
        """Add a milestone to the project"""
        milestone = {
            "id": len(self.data["milestones"]) + 1,
            "title": title,
            "description": description,
            "target_date": target_date,
            "completed": False,
            "created_at": datetime.now().isoformat()
        }
        self.data["milestones"].append(milestone)
        self.save()
        return milestone
    
    def mark_milestone_complete(self, milestone_id):
        """Mark a milestone as complete"""
        for milestone in self.data["milestones"]:
            if milestone["id"] == milestone_id:
                milestone["completed"] = True
                self.save()
                return True
        return False
    
    def log_progress(self, entry):
        """Log a progress entry"""
        log_entry = {
            "date": datetime.now().isoformat(),
            "entry": entry
        }
        self.data["progress_log"].append(log_entry)
        self.save()
        return log_entry
    
    def save(self):
        """Save the tracker data to file"""
        with open(self.tracker_file, 'w') as f:
            json.dump(self.data, f, indent=2)
    
    def get_status_report(self):
        """Generate a status report"""
        total_tasks = len(self.data["tasks"])
        completed_tasks = len([t for t in self.data["tasks"] if t["status"] == "done"])
        in_progress_tasks = len([t for t in self.data["tasks"] if t["status"] == "in_progress"])
        todo_tasks = len([t for t in self.data["tasks"] if t["status"] == "todo"])
        
        total_milestones = len(self.data["milestones"])
        completed_milestones = len([m for m in self.data["milestones"] if m["completed"]])
        
        report = {
            "project_summary": {
                "total_tasks": total_tasks,
                "completed_tasks": completed_tasks,
                "in_progress_tasks": in_progress_tasks,
                "todo_tasks": todo_tasks,
                "completion_percentage": (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
            },
            "milestone_summary": {
                "total_milestones": total_milestones,
                "completed_milestones": completed_milestones,
                "milestone_completion_percentage": (completed_milestones / total_milestones * 100) if total_milestones > 0 else 0
            },
            "recent_progress": self.data["progress_log"][-5:]  # Last 5 entries
        }
        
        return report


def main():
    """Main function to demonstrate the project tracker"""
    tracker = ProjectTracker("~/research/LifeBetter")
    
    print("LifeBetter Project Tracker")
    print("="*30)
    
    # Add some sample tasks
    tracker.add_task("Implement core meta-learning algorithm", 
                     "Develop the primary meta-learning functionality", 
                     "high", 
                     "in_progress")
    
    tracker.add_task("Write comprehensive documentation", 
                     "Document all major components and APIs", 
                     "medium", 
                     "todo")
    
    tracker.add_task("Create unit tests", 
                     "Develop tests for all critical functions", 
                     "high", 
                     "todo")
    
    # Add a milestone
    tracker.add_milestone("Alpha Release", 
                          "Initial working version of the meta-learning system", 
                          "2023-12-31")
    
    # Log some progress
    tracker.log_progress("Completed initial architecture design")
    tracker.log_progress("Implemented basic meta-learner class")
    tracker.log_progress("Created project documentation structure")
    
    # Generate and display status report
    report = tracker.get_status_report()
    
    print("\nTask Summary:")
    print(f"  Total: {report['project_summary']['total_tasks']}")
    print(f"  Completed: {report['project_summary']['completed_tasks']}")
    print(f"  In Progress: {report['project_summary']['in_progress_tasks']}")
    print(f"  To Do: {report['project_summary']['todo_tasks']}")
    print(f"  Completion: {report['project_summary']['completion_percentage']:.1f}%")
    
    print(f"\nMilestone Summary:")
    print(f"  Total: {report['milestone_summary']['total_milestones']}")
    print(f"  Completed: {report['milestone_summary']['completed_milestones']}")
    print(f"  Completion: {report['milestone_summary']['milestone_completion_percentage']:.1f}%")
    
    print(f"\nRecent Progress Entries:")
    for entry in report['recent_progress']:
        print(f"  {entry['date'][:10]}: {entry['entry']}")


if __name__ == "__main__":
    main()
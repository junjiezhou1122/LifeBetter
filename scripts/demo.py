#!/usr/bin/env python3
"""
Demo script for the LifeBetter Meta-Learning System
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.meta_learner import MetaLearner


def main():
    """Main demo function"""
    print("Initializing LifeBetter Meta-Learning System...")
    
    # Create a meta-learner instance
    learner = MetaLearner(memory_size=50, learning_rate=0.01)
    
    print(f"Meta-learner initialized with memory size: {learner.memory_size}")
    print(f"Learning rate: {learner.learning_rate}")
    
    # Simulate some learning experiences
    experiences = [
        {
            "task": "habit_formation",
            "input": {"habit": "morning_exercise", "duration": 30},
            "output": {"consistency": 0.7, "energy_level": 0.8},
            "outcome": "partial_success"
        },
        {
            "task": "learning_new_skill",
            "input": {"skill": "python_programming", "hours_per_day": 2},
            "output": {"progress": 0.6, "retention": 0.85},
            "outcome": "success"
        },
        {
            "task": "time_management",
            "input": {"technique": "pomodoro", "session_length": 25},
            "output": {"focus_score": 0.9, "tasks_completed": 8},
            "outcome": "success"
        }
    ]
    
    print("\nAdding experiences to the meta-learner...")
    for i, exp in enumerate(experiences):
        print(f"Experience {i+1}: {exp['task']}")
        learner.learn_from_experience(exp)
    
    # Get performance insights
    print("\nPerformance Insights:")
    insights = learner.get_performance_insights()
    for key, value in insights.items():
        print(f"  {key}: {value}")
    
    # Adapt learning strategy for a new task
    print("\nAdapting learning strategy for new task...")
    strategy = learner.adapt_learning_strategy("improve_sleep_quality")
    print(f"Recommended approach: {strategy['approach']}")
    print(f"Suggested learning rate: {strategy['learning_rate']}")
    print(f"Suggestions: {strategy['suggestions']}")
    
    print("\nLifeBetter Meta-Learning System demo completed!")


if __name__ == "__main__":
    main()
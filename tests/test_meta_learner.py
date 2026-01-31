"""
Tests for the LifeBetter Meta-Learning System
"""

import unittest
from src.meta_learner import MetaLearner


class TestMetaLearner(unittest.TestCase):
    """Test cases for the MetaLearner class"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.learner = MetaLearner(memory_size=10, learning_rate=0.01)
        
    def test_initialization(self):
        """Test that MetaLearner initializes correctly"""
        self.assertEqual(self.learner.memory_size, 10)
        self.assertEqual(self.learner.learning_rate, 0.01)
        self.assertEqual(len(self.learner.experience_memory), 0)
        self.assertEqual(len(self.learner.meta_knowledge), 0)
        
    def test_learn_from_experience(self):
        """Test learning from experience"""
        experience = {
            "task_type": "optimization",
            "strategy": {"approach": "gradient_descent"},
            "outcome": {"score": 0.95}
        }
        
        self.learner.learn_from_experience(experience)
        
        self.assertEqual(len(self.learner.experience_memory), 1)
        self.assertEqual(self.learner.experience_memory[0], experience)
        # Verify meta-knowledge update
        self.assertIn("optimization", self.learner.meta_knowledge)
        self.assertIn("gradient_descent", self.learner.meta_knowledge["optimization"])
        self.assertEqual(self.learner.meta_knowledge["optimization"]["gradient_descent"]["avg_score"], 0.95)

    def test_strategy_adaptation_with_history(self):
        """Test strategy adaptation based on history"""
        # Train with two strategies for the same task
        exp1 = {
            "task_type": "classification", 
            "strategy": {"approach": "random_forest"},
            "outcome": {"score": 0.8}
        }
        exp2 = {
            "task_type": "classification", 
            "strategy": {"approach": "neural_network"},
            "outcome": {"score": 0.9}
        }
        
        self.learner.learn_from_experience(exp1)
        self.learner.learn_from_experience(exp2)
        
        # Should pick neural_network (0.9 > 0.8)
        strategy = self.learner.adapt_learning_strategy("classification")
        self.assertEqual(strategy["approach"], "neural_network")
        
    def test_memory_limit(self):
        """Test that memory size is limited"""
        # Add more experiences than memory size
        for i in range(15):
            experience = {
                "task_type": f"task_{i}", 
                "strategy": {"approach": "default"},
                "outcome": {"score": 0.5}
            }
            self.learner.learn_from_experience(experience)
            
        # Memory should be limited to the specified size
        self.assertEqual(len(self.learner.experience_memory), 10)
        
    def test_adapt_learning_strategy(self):
        """Test adapting learning strategy"""
        strategy = self.learner.adapt_learning_strategy("new_task")
        
        self.assertIsInstance(strategy, dict)
        self.assertIn("learning_rate", strategy)
        self.assertIn("approach", strategy)
        self.assertIn("suggestions", strategy)
        
    def test_get_performance_insights(self):
        """Test getting performance insights"""
        insights = self.learner.get_performance_insights()
        
        self.assertIsInstance(insights, dict)
        self.assertIn("total_experiences", insights)
        self.assertIn("memory_usage", insights)
        self.assertIn("meta_knowledge_size", insights)


if __name__ == "__main__":
    unittest.main()
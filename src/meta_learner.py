"""
LifeBetter Meta-Learning System
Main meta-learning implementation
"""

class MetaLearner:
    """
    A meta-learning system that learns how to learn better over time.
    """
    
    def __init__(self, memory_size=1000, learning_rate=0.001):
        """
        Initialize the meta-learner
        
        Args:
            memory_size (int): Size of the experience memory
            learning_rate (float): Learning rate for meta-learning
        """
        self.memory_size = memory_size
        self.learning_rate = learning_rate
        self.experience_memory = []
        self.meta_knowledge = {}
        
    def learn_from_experience(self, experience):
        """
        Learn from a specific experience
        
        Args:
            experience (dict): Experience data with inputs, outputs, and outcomes
        """
        # Store experience in memory
        self.experience_memory.append(experience)
        
        # Trim memory if it exceeds size limit
        if len(self.experience_memory) > self.memory_size:
            self.experience_memory.pop(0)
            
        # Update meta-knowledge based on experience
        self._update_meta_knowledge(experience)
        
    def _update_meta_knowledge(self, experience):
        """
        Update the meta-knowledge based on new experience
        
        Args:
            experience (dict): Experience data
        """
        task_type = experience.get("task_type", "general")
        strategy = experience.get("strategy", {})
        outcome = experience.get("outcome", {})
        score = outcome.get("score", 0.0)
        
        # Identify the strategy approach
        approach = strategy.get("approach", "default")
        
        if task_type not in self.meta_knowledge:
            self.meta_knowledge[task_type] = {}
            
        if approach not in self.meta_knowledge[task_type]:
            self.meta_knowledge[task_type][approach] = {
                "count": 0, 
                "total_score": 0.0,
                "avg_score": 0.0
            }
            
        # Update running statistics
        stats = self.meta_knowledge[task_type][approach]
        stats["count"] += 1
        stats["total_score"] += score
        stats["avg_score"] = stats["total_score"] / stats["count"]
        
    def adapt_learning_strategy(self, task_description):
        """
        Adapt learning strategy based on task and past experiences
        
        Args:
            task_description (str): Description of the current task (used as task_type)
            
        Returns:
            dict: Recommended learning strategy
        """
        # Treat description as type for simple matching
        task_type = task_description
        
        best_approach = "default"
        best_score = -float('inf')
        found_match = False
        
        # Look for best performing strategy for this task type
        if task_type in self.meta_knowledge:
            strategies = self.meta_knowledge[task_type]
            if strategies:
                for approach, stats in strategies.items():
                    if stats["avg_score"] > best_score:
                        best_score = stats["avg_score"]
                        best_approach = approach
                found_match = True
        
        suggestions = []
        if found_match:
            suggestions.append(f"Selected '{best_approach}' based on historical avg score: {best_score:.2f}")
        else:
            suggestions.append("No historical data for this task type; using default.")

        return {
            "learning_rate": self.learning_rate,
            "approach": best_approach,
            "suggestions": suggestions
        }
        
    def get_performance_insights(self):
        """
        Get insights about learning performance
        
        Returns:
            dict: Performance metrics and insights
        """
        return {
            "total_experiences": len(self.experience_memory),
            "memory_usage": len(self.experience_memory) / self.memory_size,
            "meta_knowledge_size": len(self.meta_knowledge)
        }


def create_meta_learner(config=None):
    """
    Factory function to create a MetaLearner instance
    
    Args:
        config (dict): Configuration dictionary
        
    Returns:
        MetaLearner: Configured meta-learner instance
    """
    if config is None:
        config = {"memory_size": 1000, "learning_rate": 0.001}
        
    return MetaLearner(
        memory_size=config.get("memory_size", 1000),
        learning_rate=config.get("learning_rate", 0.001)
    )
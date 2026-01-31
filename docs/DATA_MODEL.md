# LifeBetter Data Model

## Experience Data Structure

### Experience Object
The fundamental unit of learning in LifeBetter is the Experience object:

```json
{
  "task": "string",
  "input": "any",
  "output": "any", 
  "outcome": "string",
  "timestamp": "ISO 8601 datetime",
  "metadata": {
    "difficulty": "number",
    "duration": "number",
    "context": "object"
  }
}
```

Fields:
- `task`: Description of the learning task
- `input`: Input data provided to the learning system
- `output`: Output produced by the learning system
- `outcome`: Success measure or result classification
- `timestamp`: When the experience occurred
- `metadata`: Additional contextual information

## Meta-Knowledge Structure

### Knowledge Entry
Knowledge accumulated about learning patterns:

```json
{
  "pattern_id": "string",
  "pattern_type": "string",
  "conditions": "object",
  "recommendations": "object",
  "confidence": "number",
  "last_updated": "ISO 8601 datetime"
}
```

Fields:
- `pattern_id`: Unique identifier for the pattern
- `pattern_type`: Type of pattern (efficiency, adaptation, etc.)
- `conditions`: Conditions under which pattern applies
- `recommendations`: Actions suggested when pattern applies
- `confidence`: Confidence in the pattern's validity
- `last_updated`: When the pattern was last updated

## Strategy Structure

### Learning Strategy
Recommended approach for tackling a learning task:

```json
{
  "learning_rate": "number",
  "approach": "string",
  "suggestions": ["string"],
  "estimated_efficiency": "number",
  "applicable_contexts": ["string"]
}
```

Fields:
- `learning_rate`: Recommended learning rate
- `approach`: Type of learning approach to use
- `suggestions`: Additional recommendations
- `estimated_efficiency`: Expected effectiveness
- `applicable_contexts`: Contexts where strategy is effective

## Performance Metrics

### Insights Object
Performance measurements for the meta-learning system:

```json
{
  "total_experiences": "number",
  "memory_usage": "number",
  "meta_knowledge_size": "number",
  "learning_efficiency": "number",
  "adaptation_speed": "number"
}
```

Fields:
- `total_experiences`: Count of stored experiences
- `memory_usage`: Percentage of memory used
- `meta_knowledge_size`: Number of knowledge entries
- `learning_efficiency`: Measure of learning effectiveness
- `adaptation_speed`: Speed of adaptation to new tasks

## Configuration Model

### Project Configuration
Settings for the LifeBetter system:

```json
{
  "project": {
    "name": "string",
    "version": "string",
    "description": "string"
  },
  "directories": {
    "docs": "string",
    "src": "string",
    "tests": "string",
    "config": "string",
    "scripts": "string",
    "memory": "string"
  },
  "meta_learning": {
    "learning_rate": "number",
    "memory_size": "number",
    "adaptation_steps": "number"
  }
}
```
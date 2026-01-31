# LifeBetter Setup Guide

## Prerequisites

### System Requirements
- Python 3.8 or higher
- At least 2GB free disk space
- 4GB RAM recommended for optimal performance

### Software Dependencies
- Git for version control
- pip for package management
- virtualenv (recommended)

## Installation

### 1. Clone or Create the Project
```bash
mkdir -p ~/research/LifeBetter
cd ~/research/LifeBetter
```

### 2. Set Up Virtual Environment (Recommended)
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

If you don't have a requirements.txt file yet, install the essential packages:
```bash
pip install numpy pandas scikit-learn torch tensorflow PyYAML tqdm pytest
```

### 4. Verify Installation
```bash
python -c "from src.meta_learner import MetaLearner; print('Installation successful')"
```

## Initial Configuration

### 1. Configure Project Settings
Edit `config/project_config.yaml` to set your preferred parameters:

```yaml
meta_learning:
  learning_rate: 0.001      # Adjust as needed
  memory_size: 1000         # Number of experiences to remember
  adaptation_steps: 10      # Steps for strategy adaptation
```

### 2. Set Up Directories
Ensure all required directories exist:
```bash
mkdir -p docs src tests config scripts memory
```

## Running the System

### 1. Run the Demo
```bash
python scripts/demo.py
# Or using make:
make run-demo
```

### 2. Run Tests
```bash
python -m pytest tests/
# Or using make:
make test
```

### 3. Check Project Status
```bash
python scripts/project_tracker.py
# Or using make:
make project-status
```

## Development Setup

### 1. Using Make Commands
The project includes a Makefile with common commands:

```bash
make help                    # Show available commands
make run-demo              # Run the demo script
make test                  # Run all tests
make clean                 # Clean temporary files
make install-deps          # Install dependencies
make project-status        # Show project status
```

### 2. Setting up IDE
For Python IDEs like VS Code or PyCharm:
1. Point the interpreter to your virtual environment (if used)
2. Install recommended extensions for Python development
3. Set up linting with flake8 or black

### 3. Environment Variables (Optional)
Create a `.env` file in the root directory for any environment-specific settings:

```bash
# Example .env file
LIFEBETTER_DEBUG=true
LIFEBETTER_LOG_LEVEL=info
```

## Troubleshooting

### Common Issues

#### Issue: ModuleNotFoundError
Solution: Ensure you're running from the correct directory and Python path is set correctly:
```bash
cd ~/research/LifeBetter
export PYTHONPATH="${PYTHONPATH}:."
python scripts/demo.py
```

#### Issue: Missing Dependencies
Solution: Reinstall dependencies:
```bash
pip install -r requirements.txt
```

#### Issue: Permission Errors
Solution: Ensure you have write permissions to the project directory:
```bash
chmod -R 755 ~/research/LifeBetter
```

## Verification

After setup, verify everything works:

1. Run the demo: `make run-demo`
2. Run tests: `make test`
3. Check project status: `make project-status`

You should see output indicating that the system is functioning correctly.
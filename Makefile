# Makefile for LifeBetter Meta-Learning System

# Variables
PYTHON := python3
PROJECT_DIR := .
SRC_DIR := $(PROJECT_DIR)/src
TESTS_DIR := $(PROJECT_DIR)/tests
SCRIPTS_DIR := $(PROJECT_DIR)/scripts

# Default target
help:
	@echo "LifeBetter Meta-Learning System - Available Commands:"
	@echo ""
	@echo "  make run-demo          - Run the demo script"
	@echo "  make test              - Run all tests"
	@echo "  make test-one FILE=   - Run a specific test file (e.g., make test-one FILE=test_meta_learner.py)"
	@echo "  make clean             - Clean temporary files"
	@echo "  make install-deps      - Install project dependencies"
	@echo "  make project-status    - Show project status"
	@echo ""

# Run the demo
run-demo:
	$(PYTHON) $(SCRIPTS_DIR)/demo.py

# Run all tests
test:
	$(PYTHON) -m pytest $(TESTS_DIR)/ -v

# Run a specific test
test-one:
	@if [ -z "$(FILE)" ]; then \
		echo "Please specify a test file: make test-one FILE=name_of_test_file.py"; \
		exit 1; \
	fi
	$(PYTHON) -m pytest $(TESTS_DIR)/$(FILE) -v

# Clean temporary files
clean:
	rm -rf __pycache__
	rm -rf $(SRC_DIR)/__pycache__
	rm -rf $(TESTS_DIR)/__pycache__
	rm -rf $(SCRIPTS_DIR)/__pycache__
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete

# Install dependencies
install-deps:
	pip install -r requirements.txt

# Show project status
project-status:
	$(PYTHON) $(SCRIPTS_DIR)/project_tracker.py

# Setup development environment
setup-dev:
	$(PYTHON) -m venv venv
	./venv/bin/pip install --upgrade pip
	./venv/bin/pip install -r requirements.txt

.PHONY: help run-demo test test-one clean install-deps project-status setup-dev
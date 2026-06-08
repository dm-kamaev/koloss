# Koloss

## Example

## Cross module communication

## Layers
### HTTP, CLI and etc
### Action (UseCase)
### Decorator
### Repository
### Entity
### DTO (optional)
### Guard
### No services
metric, notification

## Shared code

# Architecture Decisions
## Loading modules
Async loading module not support because require use `Proxy` that decrease perfomance (code can't extract information about method).

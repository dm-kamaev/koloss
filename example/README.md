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
### Don't use services
metric, notification

## Shared code

## Test
### Low level
### Middle level
### Up level

# Architecture Decisions
## Loading modules
Async loading module not support because require use `Proxy` that decrease perfomance (code can't extract information about method).


# TODO
* Intergration view (server render jsx)
* Integration async background task
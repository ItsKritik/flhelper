# System Patterns

## Архитектура

Основные модули:
- `core/` - ядро генерации паттернов
- `ui/` - пользовательский интерфейс
- `presets/` - управление предустановками
- `utils/` - утилиты для работы с файлами и MIDI

## Связи подсистем

- generator.ts зависит от harmony.ts и scale.ts
- ui/依赖于 core/ для генерации паттернов
- midiExporter.ts использует models/pattern.ts

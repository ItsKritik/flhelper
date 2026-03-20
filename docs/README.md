# FL-Helper

Генератор паттернов для FL-Studio. Проект для создания музыкальных паттернов с поддержкой различных гармонических структур и шкал.

## Архитектура

Источник архитектурной правды: docs/README.md

## Структура проекта

- `src/core/` - ядро генерации (generator.ts, harmony.ts, scale.ts)
- `src/ui/` - пользовательский интерфейс (gridRenderer.ts, presetBrowser.ts, settingsPanel.ts)
- `src/presets/` - предустановки
- `src/utils/` - утилиты (fileIO.ts, midiExporter.ts, validator.ts)
- `src/models/` - модели данных (pattern.ts)

## Технологический стек

- TypeScript
- Jest (тестирование)
- MIDI file handling

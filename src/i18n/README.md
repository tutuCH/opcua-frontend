# Internationalization (i18n) Implementation Guide

## Overview
This project uses `react-i18next` for internationalization with support for:
- **Traditional Chinese (zh-TW)** - Default language
- **Simplified Chinese (zh-CN)**
- **English (en)**

## Features
- **Automatic Language Detection**: Uses browser language, falls back to Traditional Chinese
- **Language Persistence**: Stores user's language choice in localStorage
- **Dynamic Language Switching**: Real-time language switching without page reload
- **TypeScript Support**: Full TypeScript integration

## Usage

### Basic Translation
```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return <h1>{t('personalSettings.title')}</h1>;
}
```

### Language Switching
```tsx
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  return (
    <select onChange={(e) => changeLanguage(e.target.value)} value={i18n.language}>
      <option value="zh-TW">繁體中文</option>
      <option value="zh-CN">简体中文</option>
      <option value="en">English</option>
    </select>
  );
}
```

### Current Language Detection
```tsx
const { i18n } = useTranslation();
const currentLanguage = i18n.language; // 'zh-TW', 'zh-CN', or 'en'
```

## Translation Files Structure
```
src/i18n/locales/
├── zh-TW.json (Traditional Chinese - Default)
├── zh-CN.json (Simplified Chinese)
└── en.json    (English)
```

## Adding New Translations

1. Add the key-value pairs to all three language files:
```json
// zh-TW.json
{
  "myFeature": {
    "title": "我的功能",
    "description": "這是描述"
  }
}

// zh-CN.json
{
  "myFeature": {
    "title": "我的功能",
    "description": "这是描述"
  }
}

// en.json
{
  "myFeature": {
    "title": "My Feature",
    "description": "This is a description"
  }
}
```

2. Use in components:
```tsx
const { t } = useTranslation();
return (
  <div>
    <h1>{t('myFeature.title')}</h1>
    <p>{t('myFeature.description')}</p>
  </div>
);
```

## Language Detection Logic

The system detects language in this order:
1. **localStorage** (`i18nextLng` key) - User's previous choice
2. **Browser navigator language** - System default
3. **Fallback to Traditional Chinese** (`zh-TW`)

## Implemented Features

The PersonalInfoSection component now includes:
- ✅ Dynamic language switching (cycles through zh-TW → zh-CN → en)
- ✅ All UI text translated for all three languages
- ✅ Form validation messages translated
- ✅ Success/error messages translated
- ✅ Language preference persistence

## Testing
- Access the settings page at `/settings`
- Click the "切換語言" (Switch Language) button to cycle through languages
- Language choice is automatically saved and persists across browser sessions
- All text content updates immediately without page reload

## Browser Support
The language detection supports:
- Modern browsers with `navigator.language` API
- Fallback for browsers without language detection
- localStorage for language persistence
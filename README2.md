

Если честно, сейчас на низкой морали, и опасаюсь переходить завтра к рефакторингу чартов. Кажется что нам нужно о многом договориться прежде чем какой-либо рефакторинг будет иметь смысл. Для начала это три больших вопроса:

1. Файловая структура библиотеки и приложений (feature-based или dux)
```
. lib/shared/src
. . components // common component
. . . SharedComponent.tsx
. . . SharedButton.tsx
. . . ...
. . utils // common utils
. . . dateFormatters.ts
. . . ...
. . types // common types
. . . CommonTypes.ts
. . . ...
. . features
. . . routers
. . . . index.ts
. . . . components // routers feature component
. . . . . RoutersTable.tsx
. . . . . RouterForm.tsx
. . . . . ComplexRouterComponent
. . . . . . index.tsx
. . . . . . PartA.tsx
. . . . . . PartB.tsx
. . . . routers.api.ts
. . . . routers.state.ts
. . . . routers.types.ts
. . . stats
. . . . ...
. . . clients
. . . . ...
. . . legalEntities
. . . . ...
. . . traffic
```
Так могло бы быть с общим бэком (и так рекоммендует redux-сообщество). Но с разными бэками папка `features` смысла не имеет. Однако фича с роутерами (та которая оказалась в либе) завелась и в админке и в клиентском (что было и осталось экспериментально, но очень приятно :)


2. Инициализация приложения (которая сейчас статическая и синхронная, основана на синглтонах, что на мой взгляд слишком жестко). А хочется асинхронный IoC-контейнер. И вот почему:

Рассмотрим наш локализатор
```typescript
//apps/admin/src/locales/intl.ts
import messages from 'apps/admin/src/locales/ru.json';
import { createIntl, createIntlCache } from 'react-intl';

const cache = createIntlCache();
const intl = createIntl({ messages, locale: process.env.REACT_APP_LOCALE ?? 'en' }, cache);

export default intl;
```
И все клиенты локализатора импортируют файл (*singletone*-паттерн) непосредственно:
```typescript
//libs/shared/src/intl.ts
import intl from 'apps/admin/src/locales/intl'
const localizedMessage = intl.formatMessage({id: 'router.serial'});
```

Если хотим локализатор сделать общим (вынести в библиотеку), файл локали нужно передать в зависимость, например так:
```typescript
//apps/admin/src/index.ts
import messages from 'apps/admin/src/locales/ru.json';
import { create as createIntl} from 'libs/shared/src/intl';
import ioc from 'ioc-container';

const intl = createIntl(messages) 

//или так:
const intlDependencies = { messages } 
const intl = createIntl(intlDependencies);

ioc.register('intl', intl);
//...
```

И далее используем созданный инстанс:
```typescript
//apps/admin/src/features/routers/routers.state.ts
import ioc from 'ioc-container';
// Ждем удовлетворения зависимости :)
const intl = await ioc.get('intl'); // topLevelAwait позволяет
const localizedMessage = intl.formatMessage({id: 'router.serial'});
```
И это далеко не единственный пример где хочется сделать нечто подобное.

В общем, у меня есть какое-то видение, и я мог бы его детально описать. Но можно еще снизить риск ошибки. А вдруг у нас и так все хорошо, и ничего этого нам не нужно? Как смотрите на то чтоб я взял консультацию? Мы с Колянычем (Кочетковым) списывались недавно, я спрашивал у него вскользь, консультирует ли он. Он не проч. Прайс пока не обсуждали но надеюсь з/п мне хватит :). По сути, это мне лично нужно чтоб не делать глупостей. Собственно вопрос -- как смотрите если я покажу ему код (фронт)? Содержимое базы показывать разумеется не стану, (а структуру базы -- возможно понадобится).

[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)

[![LazyingArt banner](https://github.com/lachlanchen/lachlanchen/raw/main/figs/banner.png)](https://github.com/lachlanchen/lachlanchen/blob/main/figs/banner.png)

# LazyPoker · Open Table

*Examina las opciones válidas y sus pruebas, y después confirma exactamente una acción.*

[![Lazying Art](https://img.shields.io/badge/Lazying-Art-0EA5E9?style=flat-square)](https://lazying.art) [![App screenshot](https://img.shields.io/badge/App-screenshot-173F5F?style=flat-square)](../docs/images/app.png) [![GitHub Sponsors](https://img.shields.io/badge/GitHub-Sponsors-EA4AAA?style=flat-square&logo=githubsponsors)](https://github.com/sponsors/lachlanchen)

LazyPoker es un profesor de decisiones local para una mano completa de Texas Hold’em mano a mano y mesas introductorias de Contract Bridge y Guandan con límites claros. El código determinista controla reglas, ocultación de información, puntuación, historial y persistencia.

## Apoyar herramientas de enseñanza abiertas

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://img.shields.io/badge/Donate-LazyingArt-0EA5E9?style=for-the-badge&logo=kofi&logoColor=white)](https://chat.lazying.art/donate) | [![PayPal](https://img.shields.io/badge/PayPal-RongzhouChen-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/RongzhouChen) | [![Stripe](https://img.shields.io/badge/Stripe-Donate-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |

## Vista previa de la aplicación

[![Captura de pantalla de la aplicación](../docs/images/app.png)](../docs/images/app.png)

La mesa de aprendizaje ofrece a cada juego su propio instrumento compacto de decisión, no una capa genérica de «poder»:

- Hold’em usa un mapa de mesa y precio para textura pública, equidad de cartas visibles, posibles mejoras con la próxima carta, precio de igualar, stack efectivo y compromiso de cada candidato.
- Bridge usa una brújula de baza para palo de salida, triunfo fijo, ganador visible, obligación de asistir y coste de rango de la carta previsualizada.
- Guandan usa una cola de iniciativa para orden de respuesta, umbral, cartas individuales que superan, recuentos públicos del equipo y coste de reserva de cartas altas.

Cada turno propio muestra una sugerencia didáctica transparente. Pasar el puntero, enfocar o tocar previsualiza sin modificar; clic derecho o `Esc` la borra y solo el botón de confirmación ejecuta la acción.

## Qué se puede jugar

- Texas Hold’em: una mano completa heads-up sin límite con ciegas, cuatro rondas de apuestas, all-in, retirada, evaluación del showdown y liquidación del bote.
- Contract Bridge: una mesa de iniciación de cinco bazas para practicar seguir el palo, el triunfo fijo de picas, el ganador de cada baza y la coordinación de pareja; la subasta, el muerto, los contratos y la puntuación duplicada quedan fuera de esta lección.
- Guandan: una mesa de iniciación de seis cartas y solo jugadas individuales para practicar iniciativa, pases y coordinación de pareja; las combinaciones, bombas, tributos, comodines de nivel y puntuación de ascenso quedan fuera de esta lección.
- Todos los modos usan el mismo ciclo: examinar una opción legal generada por el motor de reglas determinista, previsualizar sin cambiar el estado y confirmar de forma explícita.

## Mapa del repositorio

| Ruta | Propósito |
| --- | --- |
| [`src/core/`](../src/core/) | Cartas, reglas, candidatos válidos, transiciones de estado, ocultación de información, evaluación y persistencia deterministas. |
| [`src/i18n/catalogs.ts`](../src/i18n/catalogs.ts) | Once catálogos completos para estudiantes con claves estables y marcadores de posición. |
| [`src/core/decisionAnalysis.ts`](../src/core/decisionAnalysis.ts) | Evidencia de decisión de Hold’em, Bridge y Guandan derivada solo de observaciones públicas. |
| [`src/i18n/analysisCatalogs.ts`](../src/i18n/analysisCatalogs.ts) | Traducciones contextuales de los tres instrumentos de análisis específicos. |
| [`src/App.tsx`](../src/App.tsx) | La mesa de juego multilingüe compartida, la vista previa, la confirmación, el historial y la interfaz de método. |
| [`docs/model-options.md`](../docs/model-options.md) | Opciones opcionales de solucionador y modelo con sus límites de evidencia y seguridad. |
| [`docs/smoke-test.md`](../docs/smoke-test.md) | Pasos repetibles de revisión del navegador. |
| [`docs/images/app.png`](../docs/images/app.png) | Captura de pantalla de la aplicación actual. |

## Inicio rápido

Requiere Node.js `^20.19.0` o `>=22.12.0`, además de npm.

```bash
npm ci
npm run dev
```

<http://127.0.0.1:8020/>

Abra la URL local que muestra Vite. El puerto de desarrollo es 8020; si está ocupado, el modo de puerto estricto falla de forma segura en vez de elegir otro.

## Autoridad, privacidad y evidencia

- Las vistas públicas eliminan el orden del mazo, las semillas, los libros de contabilidad de solicitudes, las cartas de oponentes, las cartas de socios y el análisis privado antes de renderizarse.
- Los ID de candidato opacos vinculan el estado autoritativo completo, el actor y la acción canónica; las opciones obsoletas o desconocidas se rechazan de forma segura.
- La vista previa es hipotética y nunca revela una futura carta comunitaria. Solo la confirmación cambia el estado.
- Las reglas exactas, las muestras calculadas y la estrategia redactada permanecen etiquetadas por separado. La equidad de Hold’em supone cartas válidas no vistas uniformes; las «mejoras» solo mejoran la mano visible formada y no son outs ganadores garantizados. Ningún valor lee el rango rival ni se presenta como GTO.
- Bridge solo lee la mano del alumno y cartas ya jugadas; Guandan solo la mano propia, la carta actual, recuentos públicos y cola de respuesta. Cambiar únicamente estado oculto no cambia el análisis semántico.

## Verificación

```bash
npm run lint
npm test
npm run build
npm run audit
bash -n scripts/*.sh
bash scripts/test-model-safety.sh
git diff --check
```

Las pruebas cubren reparto determinista, unicidad, puntuación y conservación de chips, candidatos obsoletos, redacción y no interferencia oculta, turnos opacos del agente, idempotencia, conflictos de persistencia, sugerencias, vistas previas borrables sin mutación, recálculo tras confirmar, instrumentos específicos, puerto fijo y paridad estricta de los once catálogos.

## Citación

Si utiliza LazyPoker en docencia o investigación, cite el repositorio. GitHub lee [CITATION.cff](../CITATION.cff) y muestra un panel Citar este repositorio.

```bibtex
@software{chen_lazy_poker_2026,
  author  = {Chen, Lachlan},
  title   = {LazyPoker: Hold'em, Contract Bridge, and Guandan Decision Teacher},
  year    = {2026},
  version = {0.1.0},
  url     = {https://github.com/lachlanchen/LazyPoker}
}
```

## Estado

El modo Texas Hold’em ofrece una mano heads-up completa. Bridge y Guandan están claramente etiquetados como módulos didácticos para principiantes, no como implementaciones competitivas completas. Los modelos opcionales están desactivados por defecto.

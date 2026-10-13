## 📋 Descripción del Cambio
<!-- Explica de forma concisa qué problema resuelve este Pull Request o qué funcionalidad agrega -->

## 🏛️ Impacto Arquitectónico
- [ ] Capa de Dominio (Entidades, Value Objects, Domain Events)
- [ ] Capa de Aplicación (Commands, Queries, Handlers, DTOs)
- [ ] Capa de Infraestructura (Repositories, Message Queue, DB)
- [ ] Capa de Presentación / API (Routes, Controllers, Middlewares)
- [ ] Frontend (UI, React Query, Componentes)

## 🧪 Pruebas y Validación Realizadas
- [ ] Pruebas unitarias ejecutadas (`npm run test`)
- [ ] Linter y verificación de tipos TypeScript sin errores (`npm run lint` & `npm run build`)
- [ ] Cero uso de `any` (estricto tipado estático)
- [ ] Verificado en entorno local con Docker / PostgreSQL

## 🔒 Checklist de Seguridad y Calidad
- [ ] No se incluyen secretos, tokens ni variables de entorno (`.env`)
- [ ] Cumple con principios SOLID y Clean Architecture
- [ ] Manejo de errores funcional mediante `Either<Failure, Success>`
- [ ] Documentación actualizada si aplica

---
> ⚠️ **Restricción de Rama:** Este PR requiere la aprobación obligatoria de un revisor autorizado (`@Poli-devs`) antes de ser fusionado en `develop` o `main`.

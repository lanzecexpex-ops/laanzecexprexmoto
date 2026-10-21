# LANZEC MOTO EXPRESS — interfaz completa preparada para Supabase

## Contenido
- `index.html`: portada y navegación.
- `login.html`: inicio de sesión.
- `registro.html`: registro de clientes y transportistas.
- `cliente.html`: panel del cliente y creación de solicitudes.
- `motorizado.html`: panel del transportista y documentación.
- `admin.html`: panel administrativo.
- `assets/styles.css`: diseño adaptable a celular y escritorio.
- `assets/app.js`: navegación, formularios y demostración local de interfaz.
- `assets/supabase-config.js`: punto de configuración para Supabase.
- `database/schema.sql`: esquema inicial propuesto para la siguiente etapa.

## Importante
Esta entrega contiene la interfaz completa y la estructura inicial para continuar con la integración. No es todavía un sistema conectado a una base de datos real. Los formularios de autenticación y las acciones que requieren persistencia se muestran como pendientes de integración hasta configurar las credenciales y ejecutar/revisar el esquema SQL en tu proyecto Supabase.

## Siguiente etapa
1. Crear o confirmar el proyecto Supabase.
2. Configurar URL y clave pública (publishable/anon) en `assets/supabase-config.js`.
3. Revisar y ejecutar `database/schema.sql`.
4. Implementar políticas RLS, almacenamiento privado, funciones RPC y flujos reales de Auth.
5. Probar cada rol con cuentas reales antes de publicar.

Nunca pongas la `service_role` key en archivos del navegador.

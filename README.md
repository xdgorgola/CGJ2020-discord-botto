# CGJ Discord Botto

Bot de Discord para el Caracas Game Jam

## Funcionalidades

Algunas de las funcionalidades del bot incluyen:

- Otorgar un rol de ingreso a los miembros que escriban un mensaje en un canal determinado (útil para dar bienvenida y asegurar que los usuarios leen un mensaje inicial)
- Servir de canal para enviar mensajes a los admins
- Enviar mensajes programados a un canal determinado
- Otorgar roles a usuarios cuando reaccionen a un mensaje

## Requerimientos

El bot está escrito en `Node.JS`, ha sido probado con versiones de Node desde la `v14` hasta la `v17`.

## Instalación

Para instalar las dependencias, basta con hacer `npm install` en la carpeta del proyecto.

Luego, crea un archivo en la carpeta [`resources`](./resources/) llamado `config.json`, con el siguiente formato (reemplazando todo lo que está encerrado en `< >` por valores reales):

```json
{
  "prefix": "!",
  "token": "<token del bot en Discord>",
  "bot_username": "<nombre de usuario del bot>",
  "admin_id": "<id del rol de admins en el servidor>",
  "welcome_path": "resources/bienvenida.txt",
  "roles_msg_path": "resources/roles_message.txt",
  "roles_msg_id": "<ID del mensaje que manejará los roles por reacciones>",
  "roles_msg_channel": "<canal donde se encuentra el mensaje anterior>",
  "roles_table_path": "resources/RolesReactionData.json",
  "entry_channel_id": "<ID del canal de bienvenida>",
  "accepted_role_id": "<ID del rol a asignar a los usuarios que pasen la prueba de bienvenida>",
  "guild_id": "<ID del servidor>",
  "scheduled_messages_channel": "<ID del canal donde se enviarán los mensajes programados>"
}
```

Puedes obtener los IDs requeridos desde la interfaz de Discord habilitando el _Developer mode_ en las opciones avanzadas.

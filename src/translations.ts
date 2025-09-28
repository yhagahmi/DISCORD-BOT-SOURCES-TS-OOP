export default {
    // TestCommand
    "testcmd": {
        ru: "тест ектс",
        en: "adaw testt"
    },

    // SetlangCommand
    "setlang": {
        ru: "Успешно установлен русский язык.",
        en: "Successfully changed to English"
    },
    "base.lang": {
        ru: "россия zov",
        en: "amerima usa deratski ruski"
    },
    "setlang.alr": {
        ru: 'Этот язык уже стоит.',
        en: 'This language already using.'
    },

    // PingCommand
    "ping": {
        ru: "Пинг-понг!",
        en: "Ping-pong!"
    },
    "ping.title": {
        ru: '🏓 Понг!',
        en: '🏓 Pong!'
    },
    "ping.api": {
        ru: 'Задержка API',
        en: 'API delay'
    },
    "ping.wsping": {
        ru: 'Пинг WebSocket',
        en: 'WebSocket ping'
    },
    "ping.wsstatus": {
        ru: 'Статус WebSocket',
        en: 'WebSocket status'
    },
    "ping.uptime": {
        ru: 'Время работы бота',
        en: 'Uptime'
    },
    "ping.memory": {
        ru: 'Использования памяти',
        en: 'Memory usage'
    },
    "ping.gotov": {
        ru: 'Готов',
        en: 'Done'
    },
    "ping.podkl": {
        ru: 'Подключается',
        en: 'Connecting'
    },
    "ping.vozob": {
        ru: 'Возобновляется',
        en: 'Resumes'
    },
    "ping.indent": {
        ru: 'Индентификация',
        en: 'Indentification'
    },
    "ping.ozhidguild": {
        ru: 'Ожидание гильдий',
        en: 'Waiting for guilds'
    },
    "ping.ozhidotv": {
        ru: 'Ожидание ответа',
        en: 'Waiting for answer'
    },
    "ping.ozhidvos": {
        ru: 'Ожидание восстановления',
        en: 'Waiting for recovery'
    },
    "ping.otkl": {
        ru: 'Отключен',
        en: 'Disconnected'
    },
    "ping.ozh": {
        ru: 'Ожидание',
        en: 'Waiting'
    },
    "ping.podklala": {
        ru: 'Подключение',
        en: 'Connecting'
    },
    "ping.otkllla": {
        ru: 'Отключение',
        en: 'Disconnecting'
    },
    "ping.none": {
        ru: 'Неизвестно ❌',
        en: 'None ❌'
    },
    "ping.pingign": {
        ru: 'Пингую...',
        en: 'Pinging...'
    },

    // BanCommand
    "ban": {
        ru: "{member} был успешно заблокирован модератором {moder}!",
        en: "{member} has been successfully banned by moderator {moder}!"
    },
    "banNoMember": {
        ru: "Участник не найден!",
        en: "Member is not found!"
    },
    "banNoPermsUser": {
        ru: "У вас нет права: `Блокировать участников`!",
        en: "You don't have permission: `Ban members`!"
    },
    "banRole": {
        ru: "Я не могу заблокировать этого пользователя, так как: его роль является выше моей или индетична.",
        en: "I can't ban this member, because: his role is higher than mine or indetical."
    },
    "banErr": {
        ru: "Произошла ошибка, попробуйте еще раз.",
        en: "An error occurred, please try again."
    },
    "banRErr": {
        ru: "Причина не может длинее 512 символов.",
        en: "The reason cannot be longer than 512 characters."
    },
    "banDM": {
        ru: "Вы были заблокированы на сервере {guild} модератором {mod} с причиной: \`{reason}\`.",
        en: "You have been banned from {guild} by moderator {mod} with reason: \`{reason}\`."
    },
    "banAble": {
        ru: "Этот участник не может быть заблокирован.",
        en: "This user cannot be banned."
    },
    "banNoReason": {
        ru: "Причина не указана.",
        en: "No reason provided."
    },
    "banCantBot": {
        ru: "Я не могу заблокировать самого себя!",
        en: "I can't ban myself!"
    },
    "banCantSelf": {
        ru: "Вы не можете заблокировать самого себя!",
        en: "You can't ban yourself!"
    },
    // KickCommand
    "kick": {
        ru: "{member} был успешно выгнан модератором {moder}!",
        en: "{member} has been successfully kicked by moderator {moder}!"
    },
    "kickNoMember": {
        ru: "Участник не найден!",
        en: "Member is not found!"
    },
    "kickNoPermsUser": {
        ru: "У вас нет права: `Выгонять участников`!",
        en: "You don't have permission: `Kick members`!"
    },
    "kickRole": {
        ru: "Я не могу выгнать этого пользователя, так как: его роль является выше моей или индетична.",
        en: "I can't kick this member, because: his role is higher than mine or indetical."
    },
    "kickErr": {
        ru: "Произошла ошибка, попробуйте еще раз.",
        en: "An error occurred, please try again."
    },
    "kickNoReason": {
        ru: "Причина не указана.",
        en: "No reason provided."
    },
    "kickCantBot": {
        ru: "Я не могу выгнать самого себя!",
        en: "I can't ban myself!"
    },
    "kickCantSelf": {
        ru: "Вы не можете выгнать самого себя!",
        en: "You can't ban yourself!"
    },

    // configcmd
    "config.lang": {
        ru: "Русский :flag_ru:",
        en: "English :flag_us:"
    },
    "config.title": {
        ru: "Настройки Бота",
        en: "Bot Settings"
    },
    "config.langa": {
        ru: "Язык бота: {LAN}",
        en: "Bot language: {LAN}"
    },
} as const
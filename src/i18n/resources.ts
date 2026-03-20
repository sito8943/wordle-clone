export const resources = {
  en: {
    translation: {
      app: {
        title: "Wordle",
      },
      common: {
        close: "Close",
        retry: "Try again",
        cancel: "Cancel",
        refresh: "Refresh",
        score: "Score",
        streak: "Streak",
        streakLabel: "Streak: {{count}}",
        loading: "Loading...",
      },
      nav: {
        play: "Play",
        profile: "Profile",
        scoreboard: "Scoreboard",
      },
      footer: {
        madeBy: "Made by @sito8943",
        githubRepository: "GitHub repository",
      },
      errors: {
        generic: {
          title: "Something went wrong.",
          description: "Try again in a moment.",
          action: "Try again",
        },
        appRoot: {
          title: "Wordle failed to load.",
          description: "Try again. If the issue continues, reload the page.",
          action: "Retry app",
        },
        routeOutlet: {
          title: "This page could not be rendered.",
          description: "Try again or navigate to a different section.",
          action: "Retry page",
        },
        scoreboard: {
          title: "Scoreboard table failed to render.",
          description: "Retry to load player rankings.",
          action: "Retry scoreboard",
        },
      },
      notFound: {
        title: "404 - Not Found",
        description: "The page you are looking for does not exist.",
        action: "Go back home",
      },
      scoreboard: {
        title: "Scoreboard",
        refreshAriaLabel: "Refresh scores",
        convexNotConfigured:
          "Convex is not configured (`VITE_CONVEX_URL`). Using local storage only.",
        offlineFallback:
          "Offline fallback active. Showing cached local scores.",
        currentPosition:
          "You are shown as #{{shownRank}}. Real position: #{{realRank}}.",
        headers: {
          rank: "#",
          nick: "Nick",
          score: "Score",
          date: "Date",
        },
        loading: "Loading scores...",
        empty: "No scores yet.",
      },
      profile: {
        pageTitle: "Profile",
        editAction: "Edit",
        cancelAction: "Cancel",
        settingsTitle: "Settings",
        savedMessage: "Configuration saved.",
        emptyNameError: "Name cannot be empty.",
        nameNotAvailable: "Name is not available.",
        labels: {
          name: "Name:",
          code: "Recovery code:",
          score: "Score:",
          theme: "Theme",
          themeMode: "Theme mode",
          keyboard: "Keyboard",
          keyboardMode: "Keyboard mode",
          difficulty: "Difficulty",
          endOfGameDialogs: "End-of-game dialogs",
        },
        endOfGameDialogsDescription:
          "Show dialogs when you win or lose a board.",
        codeHelp:
          "Use this 4-character code to recover your profile on another browser.",
        recovery: {
          title: "Recover profile",
          inputLabel: "Recovery code",
          action: "Load profile",
          emptyCodeError: "Recovery code cannot be empty.",
          successMessage: "Profile recovered successfully.",
        },
        saveAction: "Save",
        savingAction: "Saving...",
        animationEnabled: "Anim: on",
        animationDisabled: "Anim: off",
        themeOptions: {
          system: "System",
          light: "Light",
          dark: "Dark",
        },
        keyboardOptions: {
          onscreen: "On-screen keyboard",
          native: "Device keyboard (mobile)",
        },
        keyboardDescription:
          "Device keyboard is shown on mobile. Desktop keeps the on-screen keyboard.",
        difficultyOptions: {
          easy: "Easy",
          normal: "Normal",
          hard: "Hard",
          insane: "Insane",
        },
        difficultyRules: {
          easy: "Easy shows the word list.",
          normal: "Normal hides the word list.",
          hard: "Hard disables hints.",
          insane: "Insane enables the timer.",
        },
        difficultyChange: {
          title: "Change difficulty?",
          description:
            "You have an active game. If you change the difficulty, your current progress will be lost.",
          nextDifficulty: "New difficulty: {{difficulty}}.",
          confirm: "Yes, change and restart",
          cancel: "Cancel",
        },
      },
      layout: {
        initialPlayer: {
          title: "Welcome to Wordle",
          description:
            "Create a unique player name or recover an existing profile with your code.",
          createMode: "Create profile",
          recoverMode: "Recover profile",
          createAction: "Start playing",
          recoverAction: "Recover profile",
          nameLabel: "Player nick name",
          recoveryCodeLabel: "Recovery code",
          recoveryHelp:
            "Use the 4-character code from your profile to load that player on this browser.",
          emptyNameError: "Name cannot be empty.",
          emptyCodeError: "Recovery code cannot be empty.",
          nameNotAvailable: "Name is not available.",
          nameValidationError: "Could not validate name.",
        },
      },
      home: {
        sections: {
          boardError: {
            title: "The board crashed.",
            description: "Retry to restore the current match view.",
            action: "Retry board",
          },
          keyboardError: {
            title: "The keyboard is unavailable.",
            description: "Retry to re-enable key input.",
            action: "Retry keyboard",
          },
          dialogsError: {
            title: "A dialog failed to render.",
            description: "Retry to open this panel again.",
            action: "Retry panel",
          },
          insaneCountdownAriaLabel: "Insane mode countdown",
          winMessage: "You got it in {{count}}!",
          loseMessage: "The word was: {{answer}}",
          deviceKeyboardInputAriaLabel: "Device keyboard input",
          openDeviceKeyboard: "Open device keyboard",
        },
        gameplay: {
          boardAriaLabel: "Wordle board",
          onScreenKeyboardAriaLabel: "On-screen keyboard",
          keys: {
            deleteLetter: "Delete letter",
            submitGuess: "Submit guess",
            letter: "Letter {{key}}",
          },
          tile: {
            blank: "blank",
            statuses: {
              empty: "empty",
              tbd: "typing",
              correct: "correct",
              present: "present",
              absent: "absent",
            },
          },
        },
        toolbar: {
          wordListAriaLabel: "Word list",
          wordListButton: "Words",
          wordListUnavailable: "Word list unavailable.",
          hintAriaLabel: "Hint",
          hintButton: "Hint ({{count}})",
          helpAriaLabel: "Help",
          helpButton: "Help",
          developerConsoleAriaLabel: "Developer console",
          developerConsoleButton: "Dev console",
          insaneTimerAriaLabel: "Insane timer: {{seconds}} seconds",
          insaneTimerValue: "{{seconds}}s",
          refreshAriaLabel: "Refresh",
          loadingWordList: "Loading word list...",
        },
        refreshDialog: {
          title: "Refresh current game?",
          description:
            "You have an active board. If you refresh now, your current progress and streak will be lost.",
          confirm: "Yes, refresh game",
          cancel: "Cancel",
        },
        sessionResumeDialog: {
          title: "Resume previous game?",
          description:
            "We found an in-progress board from another browser tab session.",
          startNew: "Start new game",
          continuePrevious: "Continue previous board",
        },
        helpDialog: {
          title: "How to play",
          description: "Guess the hidden 5-letter word in up to 6 attempts.",
          rulesTitle: "Rules",
          scoringTitle: "Scoring",
          rules: {
            guessLength: "Each guess must be 5 letters long.",
            pressEnter: "Press Enter to submit your guess.",
            nonDictionary:
              "Easy, Normal, and Hard accept non-dictionary words.",
            insaneDictionary: "Insane only accepts words from the dictionary.",
            green: "Green tile: correct letter in the correct position.",
            yellow: "Yellow tile: correct letter in the wrong position.",
            gray: "Gray tile: letter is not in the word.",
          },
          scoring: {
            basePoints: "Base points are the remaining attempts after a win.",
            streakBonus:
              "Streak bonus adds your current streak value to each win.",
            easy: "Easy: x1 difficulty multiplier.",
            normal: "Normal: x2 difficulty multiplier.",
            hard: "Hard: x3 difficulty multiplier.",
            insane:
              "Insane: x4 difficulty multiplier and +1 extra point per 2 seconds left.",
            final:
              "Final score = (base points x difficulty multiplier) + streak bonus + time bonus in Insane.",
          },
        },
        endOfGame: {
          wordLabel: "Correct word",
          playAgain: "Play again",
          settingsHintPrefix: "You can disable these dialogs in",
          settingsHintLink: "Profile settings",
          settingsHintSuffix: "if you prefer.",
        },
        victoryDialog: {
          title: "Victory",
          description: "Board cleared. Here is your score breakdown.",
          scoreSummaryTitle: "Score summary",
          scoreItems: {
            base: "Base points",
            difficulty: "Difficulty multiplier",
            streak: "Streak bonus",
            time: "Time bonus",
            total: "Total",
          },
        },
        defeatDialog: {
          title: "Game Over",
          description: "That round is over.",
          bestStreak: "Best streak: {{count}}",
          closingMessage: "Better luck next time.",
          changeDifficulty: "Change difficulty",
        },
        wordListDialog: {
          title: "Possible words",
          description: "{{language}} • {{filtered}}/{{total}}",
          searchLabel: "Search",
          searchPlaceholder: "Type to filter words",
          empty: "No words found.",
        },
        developerConsole: {
          title: "Developer console",
          description: "Update current player values for local development.",
          nameLabel: "Player name",
          difficultyLabel: "Difficulty",
          keyboardModeLabel: "Keyboard mode",
          checksumDescription:
            "Recompute checksum from current Convex words and patch existing words metadata.",
          refreshChecksum: "Refresh remote checksum",
          refreshing: "Refreshing...",
          apply: "Apply",
          cancel: "Cancel",
        },
      },
      splash: {
        loadingAriaLabel: "Loading Wordle",
      },
    },
  },
  es: {
    translation: {
      app: {
        title: "Wordle",
      },
      common: {
        close: "Cerrar",
        retry: "Reintentar",
        cancel: "Cancelar",
        refresh: "Actualizar",
        score: "Puntuación",
        streak: "Racha",
        streakLabel: "Racha: {{count}}",
        loading: "Cargando...",
      },
      nav: {
        play: "Jugar",
        profile: "Perfil",
        scoreboard: "Clasificación",
      },
      footer: {
        madeBy: "Hecho por @sito8943",
        githubRepository: "Repositorio de GitHub",
      },
      errors: {
        generic: {
          title: "Algo ha ido mal.",
          description: "Vuelve a intentarlo en un momento.",
          action: "Reintentar",
        },
        appRoot: {
          title: "No se ha podido cargar Wordle.",
          description:
            "Vuelve a intentarlo. Si el problema sigue, recarga la página.",
          action: "Reintentar app",
        },
        routeOutlet: {
          title: "No se ha podido renderizar esta página.",
          description: "Vuelve a intentarlo o navega a otra sección.",
          action: "Reintentar página",
        },
        scoreboard: {
          title: "No se ha podido renderizar la tabla.",
          description: "Reintenta cargar la clasificación.",
          action: "Reintentar clasificación",
        },
      },
      notFound: {
        title: "404 - No encontrado",
        description: "La página que buscas no existe.",
        action: "Volver al inicio",
      },
      scoreboard: {
        title: "Clasificación",
        refreshAriaLabel: "Actualizar puntuaciones",
        convexNotConfigured:
          "Convex no está configurado (`VITE_CONVEX_URL`). Se usará solo almacenamiento local.",
        offlineFallback:
          "Modo sin conexión activo. Mostrando puntuaciones locales en caché.",
        currentPosition:
          "Apareces como #{{shownRank}}. Posición real: #{{realRank}}.",
        headers: {
          rank: "#",
          nick: "Nick",
          score: "Puntuación",
          date: "Fecha",
        },
        loading: "Cargando puntuaciones...",
        empty: "Todavía no hay puntuaciones.",
      },
      profile: {
        pageTitle: "Perfil",
        editAction: "Editar",
        cancelAction: "Cancelar",
        settingsTitle: "Ajustes",
        savedMessage: "Configuración guardada.",
        emptyNameError: "El nombre no puede estar vacío.",
        nameNotAvailable: "El nombre no está disponible.",
        labels: {
          name: "Nombre:",
          code: "Código de recuperación:",
          score: "Puntuación:",
          theme: "Tema",
          themeMode: "Modo de tema",
          keyboard: "Teclado",
          keyboardMode: "Modo de teclado",
          difficulty: "Dificultad",
          endOfGameDialogs: "Diálogos de fin de partida",
        },
        endOfGameDialogsDescription:
          "Muestra diálogos cuando ganas o pierdes un tablero.",
        codeHelp:
          "Usa este código de 4 caracteres para recuperar tu perfil en otro navegador.",
        recovery: {
          title: "Recuperar perfil",
          inputLabel: "Código de recuperación",
          action: "Cargar perfil",
          emptyCodeError: "El código de recuperación no puede estar vacío.",
          successMessage: "Perfil recuperado correctamente.",
        },
        saveAction: "Guardar",
        savingAction: "Guardando...",
        animationEnabled: "Anim: sí",
        animationDisabled: "Anim: no",
        themeOptions: {
          system: "Sistema",
          light: "Claro",
          dark: "Oscuro",
        },
        keyboardOptions: {
          onscreen: "Teclado en pantalla",
          native: "Teclado del dispositivo (móvil)",
        },
        keyboardDescription:
          "En móvil se muestra el teclado del dispositivo. En escritorio se mantiene el teclado en pantalla.",
        difficultyOptions: {
          easy: "Fácil",
          normal: "Normal",
          hard: "Difícil",
          insane: "Insano",
        },
        difficultyRules: {
          easy: "Fácil muestra la lista de palabras.",
          normal: "Normal oculta la lista de palabras.",
          hard: "Difícil desactiva las pistas.",
          insane: "Insano activa el temporizador.",
        },
        difficultyChange: {
          title: "¿Cambiar dificultad?",
          description:
            "Tienes una partida activa. Si cambias la dificultad, perderás tu progreso actual.",
          nextDifficulty: "Nueva dificultad: {{difficulty}}.",
          confirm: "Sí, cambiar y reiniciar",
          cancel: "Cancelar",
        },
      },
      layout: {
        initialPlayer: {
          title: "Bienvenido a Wordle",
          description:
            "Crea un nombre de jugador único o recupera un perfil existente con tu código.",
          createMode: "Crear perfil",
          recoverMode: "Recuperar perfil",
          createAction: "Empezar a jugar",
          recoverAction: "Recuperar perfil",
          nameLabel: "Nombre del jugador",
          recoveryCodeLabel: "Código de recuperación",
          recoveryHelp:
            "Usa el código de 4 caracteres de tu perfil para cargar ese jugador en este navegador.",
          emptyNameError: "El nombre no puede estar vacío.",
          emptyCodeError: "El código de recuperación no puede estar vacío.",
          nameNotAvailable: "El nombre no está disponible.",
          nameValidationError: "No se ha podido validar el nombre.",
        },
      },
      home: {
        sections: {
          boardError: {
            title: "El tablero ha fallado.",
            description: "Reintenta restaurar la vista de la partida actual.",
            action: "Reintentar tablero",
          },
          keyboardError: {
            title: "El teclado no está disponible.",
            description: "Reintenta reactivar la entrada de teclas.",
            action: "Reintentar teclado",
          },
          dialogsError: {
            title: "Un diálogo no se ha podido renderizar.",
            description: "Reintenta abrir este panel.",
            action: "Reintentar panel",
          },
          insaneCountdownAriaLabel: "Cuenta atrás del modo insano",
          winMessage: "Lo has acertado en {{count}}!",
          loseMessage: "La palabra era: {{answer}}",
          deviceKeyboardInputAriaLabel: "Entrada del teclado del dispositivo",
          openDeviceKeyboard: "Abrir teclado del dispositivo",
        },
        gameplay: {
          boardAriaLabel: "Tablero de Wordle",
          onScreenKeyboardAriaLabel: "Teclado en pantalla",
          keys: {
            deleteLetter: "Borrar letra",
            submitGuess: "Enviar intento",
            letter: "Letra {{key}}",
          },
          tile: {
            blank: "vacío",
            statuses: {
              empty: "vacío",
              tbd: "escribiendo",
              correct: "correcto",
              present: "presente",
              absent: "ausente",
            },
          },
        },
        toolbar: {
          wordListAriaLabel: "Lista de palabras",
          wordListButton: "Palabras",
          wordListUnavailable: "La lista de palabras no está disponible.",
          hintAriaLabel: "Pista",
          hintButton: "Pista ({{count}})",
          helpAriaLabel: "Ayuda",
          helpButton: "Ayuda",
          developerConsoleAriaLabel: "Consola de desarrollo",
          developerConsoleButton: "Consola dev",
          insaneTimerAriaLabel: "Temporizador insano: {{seconds}} segundos",
          insaneTimerValue: "{{seconds}}s",
          refreshAriaLabel: "Actualizar",
          loadingWordList: "Cargando lista de palabras...",
        },
        refreshDialog: {
          title: "¿Actualizar partida actual?",
          description:
            "Tienes un tablero activo. Si actualizas ahora, perderás tu progreso actual y tu racha.",
          confirm: "Sí, actualizar partida",
          cancel: "Cancelar",
        },
        sessionResumeDialog: {
          title: "¿Reanudar partida anterior?",
          description:
            "Hemos encontrado un tablero en curso de otra sesión de pestaña del navegador.",
          startNew: "Empezar nueva partida",
          continuePrevious: "Continuar tablero anterior",
        },
        helpDialog: {
          title: "Cómo jugar",
          description:
            "Adivina la palabra oculta de 5 letras en hasta 6 intentos.",
          rulesTitle: "Reglas",
          scoringTitle: "Puntuación",
          rules: {
            guessLength: "Cada intento debe tener 5 letras.",
            pressEnter: "Pulsa Enter para enviar tu intento.",
            nonDictionary:
              "Fácil, Normal y Difícil aceptan palabras fuera del diccionario.",
            insaneDictionary: "Insano solo acepta palabras del diccionario.",
            green: "Casilla verde: letra correcta en la posición correcta.",
            yellow:
              "Casilla amarilla: letra correcta en la posición incorrecta.",
            gray: "Casilla gris: la letra no está en la palabra.",
          },
          scoring: {
            basePoints:
              "Los puntos base son los intentos restantes después de ganar.",
            streakBonus:
              "El bonus de racha suma el valor de tu racha actual a cada victoria.",
            easy: "Fácil: multiplicador de dificultad x1.",
            normal: "Normal: multiplicador de dificultad x2.",
            hard: "Difícil: multiplicador de dificultad x3.",
            insane:
              "Insano: multiplicador de dificultad x4 y +1 punto extra por cada 2 segundos restantes.",
            final:
              "Puntuación final = (puntos base x multiplicador de dificultad) + bonus de racha + bonus de tiempo en Insano.",
          },
        },
        endOfGame: {
          wordLabel: "Palabra correcta",
          playAgain: "Jugar otra vez",
          settingsHintPrefix: "Puedes desactivar estos diálogos en",
          settingsHintLink: "Ajustes del perfil",
          settingsHintSuffix: "si lo prefieres.",
        },
        victoryDialog: {
          title: "Victoria",
          description: "Partida superada. Aquí tienes el desglose.",
          scoreSummaryTitle: "Resumen de puntuación",
          scoreItems: {
            base: "Puntos base",
            difficulty: "Multiplicador de dificultad",
            streak: "Bonus de racha",
            time: "Bonus de tiempo",
            total: "Total",
          },
        },
        defeatDialog: {
          title: "Game Over",
          description: "Esta ronda ha terminado.",
          bestStreak: "Mejor racha: {{count}}",
          closingMessage: "Suerte la próxima vez.",
          changeDifficulty: "Cambiar dificultad",
        },
        wordListDialog: {
          title: "Palabras posibles",
          description: "{{language}} • {{filtered}}/{{total}}",
          searchLabel: "Buscar",
          searchPlaceholder: "Escribe para filtrar palabras",
          empty: "No se han encontrado palabras.",
        },
        developerConsole: {
          title: "Consola de desarrollo",
          description:
            "Actualiza los valores del jugador actual para desarrollo local.",
          nameLabel: "Nombre del jugador",
          difficultyLabel: "Dificultad",
          keyboardModeLabel: "Modo de teclado",
          checksumDescription:
            "Recalcula el checksum a partir de las palabras actuales de Convex y actualiza sus metadatos.",
          refreshChecksum: "Actualizar checksum remoto",
          refreshing: "Actualizando...",
          apply: "Aplicar",
          cancel: "Cancelar",
        },
      },
      splash: {
        loadingAriaLabel: "Cargando Wordle",
      },
    },
  },
} as const;

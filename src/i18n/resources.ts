export const resources = {
  en: {
    translation: {
      app: {
        title: "Wordle",
        updateAvailableMessage:
          "A new version is available. Reload to update the app.",
        updateDismissAction: "Later",
        updateReloadAction: "Reload",
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
        profile: "Settings",
        scoreboard: "Scoreboard",
      },
      home: {
        donate: "Donate",
        donationThankYouAlert:
          "Thanks for supporting Wordle with your donation.",
      },
      footer: {
        madeBy: "Made by @sito8943",
        githubRepository: "GitHub repository",
      },
      errors: {
        generic: {
          title: "Something went wrong.",
          description: "Try again in a moment.",
          action: "Reload page",
        },
        appRoot: {
          title: "Wordle failed to load.",
          description: "Try again. If the issue continues, reload the page.",
          action: "Reload page",
        },
        routeOutlet: {
          title: "This page could not be rendered.",
          description: "Try again or navigate to a different section.",
          action: "Reload page",
        },
        scoreboard: {
          title: "Scoreboard table failed to render.",
          description: "Retry to load player rankings.",
          action: "Reload page",
        },
      },
      notFound: {
        title: "404 - Not Found",
        description: "The page you are looking for does not exist.",
        action: "Go to play",
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
        pageTitle: "Settings",
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
          language: "Language",
          languageMode: "Language mode",
          keyboard: "Keyboard",
          keyboardMode: "Keyboard mode",
          difficulty: "Difficulty",
          endOfGameDialogs: "End-of-game dialogs",
          manualTileSelection: "Manual tile selection",
        },
        endOfGameDialogsDescription:
          "Show dialogs when you win or lose a board.",
        manualTileSelectionDescription:
          "Click a tile before typing. The cursor will not advance automatically.",
        codeHelp:
          "Use this 4-character code to recover your settings on another browser.",
        recovery: {
          title: "Recover settings",
          inputLabel: "Recovery code",
          action: "Load settings",
          emptyCodeError: "Recovery code cannot be empty.",
          successMessage: "Settings recovered successfully.",
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
        languageOptions: {
          en: "English",
          es: "Spanish",
        },
        languageDialog: {
          title: "Choose language",
          description:
            "Select the game language. Changing language starts a new board.",
          openAction: "Language: {{language}}",
          save: "Apply language",
          browserDetected: "Detected browser language: {{language}}.",
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
          hard: "Hard disables hints and only accepts dictionary words.",
          insane:
            "Insane enables a {{seconds}}-second timer and only accepts dictionary words.",
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
            "Create a unique player name or recover existing settings with your code.",
          createMode: "Create settings",
          recoverMode: "Recover settings",
          createAction: "Start playing",
          recoverAction: "Recover settings",
          nameLabel: "Player nick name",
          recoveryCodeLabel: "Recovery code",
          recoveryHelp:
            "Use the 4-character code from your settings to load that player on this browser.",
          emptyNameError: "Name cannot be empty.",
          emptyCodeError: "Recovery code cannot be empty.",
          nameNotAvailable: "Name is not available.",
          nameValidationError: "Could not validate name.",
        },
      },
      play: {
        sections: {
          boardError: {
            title: "The board crashed.",
            description: "Retry to restore the current match view.",
            action: "Reload page",
          },
          keyboardError: {
            title: "The keyboard is unavailable.",
            description: "Retry to re-enable key input.",
            action: "Reload page",
          },
          dialogsError: {
            title: "A dialog failed to render.",
            description: "Retry to open this panel again.",
            action: "Reload page",
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
          comboFlashValue: "x{{count}}",
          normalDictionaryBonusTooltip:
            "Incorrect guess, but valid dictionary word: +{{bonus}} to the difficulty multiplier.",
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
          messages: {
            notEnoughLetters: "Not enough letters",
            notInWordList: "Not in word list",
            rowAlreadyFull: "Row is already full",
            noHintAvailable: "No hint available for this position",
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
          resultsAriaLabel: "Results",
          resultsButton: "Results",
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
            nonDictionary: "Easy and Normal accept non-dictionary words.",
            insaneDictionary:
              "Hard and Insane only accept words from the dictionary.",
            green: "Green tile: correct letter in the correct position.",
            yellow: "Yellow tile: correct letter in the wrong position.",
            gray: "Gray tile: letter is not in the word.",
          },
          scoring: {
            basePoints: "Base points are the remaining attempts after a win.",
            streakBonus:
              "Streak scales your score with x(1 + 0.3 x sqrt(streak)).",
            easy: "Easy: x1 difficulty multiplier.",
            normal: "Normal: x2 difficulty multiplier.",
            normalDictionaryBonus:
              "Normal: each incorrect dictionary-word row adds +{{bonus}} to the difficulty multiplier (○ marker).",
            hard: "Hard: x5 difficulty multiplier.",
            insane:
              "Insane: x9 difficulty multiplier and +1 extra point per 2 seconds left.",
            final:
              "Final score = round(score base x (1 + 0.3 x sqrt(streak))), where score base includes the difficulty multiplier and the Insane time bonus.",
          },
          changeDifficultyPrefix: "Want to adjust the challenge? Go to",
          changeDifficultyLink: "difficulty settings",
        },
        endOfGame: {
          wordLabel: "Correct word",
          invalidWordReport: "I think this word is not valid",
          playAgain: "Play again",
          settingsHintPrefix: "You can disable these dialogs in",
          settingsHintLink: "Settings",
          settingsHintSuffix: "if you prefer.",
        },
        victoryDialog: {
          title: "Victory",
          description: "Board cleared. Here is your score breakdown.",
          scoreSummaryTitle: "Score summary",
          shareAction: "Share board",
          shareInProgress: "Sharing...",
          sharePayloadTitle: "Wordle victory",
          sharePayloadText: "I solved this board in {{count}} tries.",
          shareErrors: {
            captureUnavailable: "The board screenshot is not available yet.",
            unavailable: "This device cannot share image files from the game.",
            captureFailed: "Could not prepare the board screenshot. Try again.",
          },
          scoreItems: {
            base: "Base points",
            difficulty: "Difficulty multiplier",
            streak: "Streak multiplier",
            time: "Time bonus",
            dictionary: "Dictionary word bonus (+{{bonus}}/word)",
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
          currentAnswerLabel: "Current answer",
          nameLabel: "Player name",
          difficultyLabel: "Difficulty",
          keyboardModeLabel: "Keyboard mode",
          checksumDescription:
            "Recompute checksum from current Convex words and patch existing words metadata.",
          refreshChecksum: "Refresh remote checksum",
          refreshing: "Refreshing...",
          checksumUpdated: "Remote checksum updated to {{checksum}}.",
          checksumRefreshError: "Could not refresh remote dictionary checksum.",
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
        updateAvailableMessage:
          "Hay una nueva versión disponible. Recarga para actualizar la app.",
        updateDismissAction: "Luego",
        updateReloadAction: "Recargar",
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
        profile: "Ajustes",
        scoreboard: "Clasificación",
      },
      home: {
        donate: "Donar",
        donationThankYouAlert: "Gracias por apoyar Wordle con tu donación.",
      },
      footer: {
        madeBy: "Hecho por @sito8943",
        githubRepository: "Repositorio de GitHub",
      },
      errors: {
        generic: {
          title: "Algo ha ido mal.",
          description: "Vuelve a intentarlo en un momento.",
          action: "Recargar página",
        },
        appRoot: {
          title: "No se ha podido cargar Wordle.",
          description:
            "Vuelve a intentarlo. Si el problema sigue, recarga la página.",
          action: "Recargar página",
        },
        routeOutlet: {
          title: "No se ha podido renderizar esta página.",
          description: "Vuelve a intentarlo o navega a otra sección.",
          action: "Recargar página",
        },
        scoreboard: {
          title: "No se ha podido renderizar la tabla.",
          description: "Reintenta cargar la clasificación.",
          action: "Recargar página",
        },
      },
      notFound: {
        title: "404 - No encontrado",
        description: "La página que buscas no existe.",
        action: "Ir a jugar",
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
        pageTitle: "Ajustes",
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
          language: "Idioma",
          languageMode: "Modo de idioma",
          keyboard: "Teclado",
          keyboardMode: "Modo de teclado",
          difficulty: "Dificultad",
          endOfGameDialogs: "Diálogos de fin de partida",
          manualTileSelection: "Selección manual de casillas",
        },
        endOfGameDialogsDescription:
          "Muestra diálogos cuando ganas o pierdes un tablero.",
        manualTileSelectionDescription:
          "Haz clic en una casilla antes de escribir. El cursor no avanzará automáticamente.",
        codeHelp:
          "Usa este código de 4 caracteres para recuperar tus ajustes en otro navegador.",
        recovery: {
          title: "Recuperar ajustes",
          inputLabel: "Código de recuperación",
          action: "Cargar ajustes",
          emptyCodeError: "El código de recuperación no puede estar vacío.",
          successMessage: "Ajustes recuperados correctamente.",
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
        languageOptions: {
          en: "Inglés",
          es: "Español",
        },
        languageDialog: {
          title: "Elegir idioma",
          description:
            "Selecciona el idioma del juego. Al cambiarlo se inicia un tablero nuevo.",
          openAction: "Idioma: {{language}}",
          save: "Aplicar idioma",
          browserDetected: "Idioma detectado del navegador: {{language}}.",
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
          hard: "Difícil desactiva las pistas y solo acepta palabras del diccionario.",
          insane:
            "Insano activa un temporizador de {{seconds}} segundos y solo acepta palabras del diccionario.",
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
            "Crea un nombre de jugador único o recupera unos ajustes existentes con tu código.",
          createMode: "Crear ajustes",
          recoverMode: "Recuperar ajustes",
          createAction: "Empezar a jugar",
          recoverAction: "Recuperar ajustes",
          nameLabel: "Nombre del jugador",
          recoveryCodeLabel: "Código de recuperación",
          recoveryHelp:
            "Usa el código de 4 caracteres de tus ajustes para cargar ese jugador en este navegador.",
          emptyNameError: "El nombre no puede estar vacío.",
          emptyCodeError: "El código de recuperación no puede estar vacío.",
          nameNotAvailable: "El nombre no está disponible.",
          nameValidationError: "No se ha podido validar el nombre.",
        },
      },
      play: {
        sections: {
          boardError: {
            title: "El tablero ha fallado.",
            description: "Reintenta restaurar la vista de la partida actual.",
            action: "Recargar página",
          },
          keyboardError: {
            title: "El teclado no está disponible.",
            description: "Reintenta reactivar la entrada de teclas.",
            action: "Recargar página",
          },
          dialogsError: {
            title: "Un diálogo no se ha podido renderizar.",
            description: "Reintenta abrir este panel.",
            action: "Recargar página",
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
          comboFlashValue: "x{{count}}",
          normalDictionaryBonusTooltip:
            "Intento incorrecto, pero palabra válida del diccionario: +{{bonus}} al multiplicador de dificultad.",
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
          messages: {
            notEnoughLetters: "Faltan letras",
            notInWordList: "No está en la lista de palabras",
            rowAlreadyFull: "La fila ya está completa",
            noHintAvailable: "No hay pista disponible para esta posición",
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
          resultsAriaLabel: "Resultados",
          resultsButton: "Resultados",
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
              "Fácil y Normal aceptan palabras fuera del diccionario.",
            insaneDictionary:
              "Difícil e Insano solo aceptan palabras del diccionario.",
            green: "Casilla verde: letra correcta en la posición correcta.",
            yellow:
              "Casilla amarilla: letra correcta en la posición incorrecta.",
            gray: "Casilla gris: la letra no está en la palabra.",
          },
          scoring: {
            basePoints:
              "Los puntos base son los intentos restantes después de ganar.",
            streakBonus:
              "La racha escala tu puntuación con x(1 + 0.3 x sqrt(racha)).",
            easy: "Fácil: multiplicador de dificultad x1.",
            normal: "Normal: multiplicador de dificultad x2.",
            normalDictionaryBonus:
              "Normal: cada fila incorrecta con palabra del diccionario suma +{{bonus}} al multiplicador de dificultad (marca ○).",
            hard: "Difícil: multiplicador de dificultad x5.",
            insane:
              "Insano: multiplicador de dificultad x9 y +1 punto extra por cada 2 segundos restantes.",
            final:
              "Puntuación final = round(puntuación base x (1 + 0.3 x sqrt(racha))), donde la puntuación base incluye el multiplicador de dificultad y el bonus de tiempo en Insano.",
          },
          changeDifficultyPrefix: "¿Quieres ajustar el desafío? Ve a",
          changeDifficultyLink: "ajustes de dificultad",
        },
        endOfGame: {
          wordLabel: "Palabra correcta",
          invalidWordReport: "Pienso que la palabra no es valida",
          playAgain: "Jugar otra vez",
          settingsHintPrefix: "Puedes desactivar estos diálogos en",
          settingsHintLink: "Ajustes",
          settingsHintSuffix: "si lo prefieres.",
        },
        victoryDialog: {
          title: "Victoria",
          description: "Partida superada. Aquí tienes el desglose.",
          scoreSummaryTitle: "Resumen de puntuación",
          shareAction: "Compartir tablero",
          shareInProgress: "Compartiendo...",
          sharePayloadTitle: "Victoria en Wordle",
          sharePayloadText: "He resuelto este tablero en {{count}} intentos.",
          shareErrors: {
            captureUnavailable:
              "La captura del tablero todavía no está disponible.",
            unavailable:
              "Este dispositivo no permite compartir imágenes desde el juego.",
            captureFailed:
              "No se ha podido preparar la captura del tablero. Inténtalo de nuevo.",
          },
          scoreItems: {
            base: "Puntos base",
            difficulty: "Multiplicador de dificultad",
            streak: "Multiplicador de racha",
            time: "Bonus de tiempo",
            dictionary: "Bonus por palabra de diccionario (+{{bonus}}/palabra)",
            total: "Total",
          },
        },
        defeatDialog: {
          title: "Fin de partida",
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
          currentAnswerLabel: "Palabra actual",
          nameLabel: "Nombre del jugador",
          difficultyLabel: "Dificultad",
          keyboardModeLabel: "Modo de teclado",
          checksumDescription:
            "Recalcula el checksum a partir de las palabras actuales de Convex y actualiza sus metadatos.",
          refreshChecksum: "Actualizar checksum remoto",
          refreshing: "Actualizando...",
          checksumUpdated: "Checksum remoto actualizado a {{checksum}}.",
          checksumRefreshError:
            "No se ha podido actualizar el checksum remoto del diccionario.",
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

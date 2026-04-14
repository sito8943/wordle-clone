import {
  CHALLENGE_DEFAULT_COMPLEX_GREEN_FOCUS_MIN_CORRECT,
  CHALLENGE_DEFAULT_COMPLEX_RARE_LETTERS,
  CHALLENGE_DEFAULT_COMPLEX_RECKLESS_MAX_REPEATS,
  CHALLENGE_DEFAULT_COMPLEX_RECKLESS_MIN_REPEATS,
  CHALLENGE_DEFAULT_COMPLEX_SPEEDSTER_MAX_DURATION_MS,
  CHALLENGE_DEFAULT_SIMPLE_LATE_WIN_MAX_DURATION_MS,
  CHALLENGE_DEFAULT_SIMPLE_NO_REPEAT_N_LETTERS,
  CHALLENGE_DEFAULT_SIMPLE_PERSISTENT_WINS_TARGET,
  CHALLENGE_DEFAULT_SIMPLE_SAME_N_ENDS,
  CHALLENGE_DEFAULT_SIMPLE_SAME_N_STARTS,
  CHALLENGE_DEFAULT_SIMPLE_YELLOW_FOCUS_MIN_PRESENT,
} from "@domain/challenges/constants";

const SPEEDSTER_MAX_SECONDS = Math.floor(
  CHALLENGE_DEFAULT_COMPLEX_SPEEDSTER_MAX_DURATION_MS / 1000,
);
const LATE_WIN_MAX_SECONDS = Math.floor(
  CHALLENGE_DEFAULT_SIMPLE_LATE_WIN_MAX_DURATION_MS / 1000,
);
const RARE_LETTERS_LABEL = CHALLENGE_DEFAULT_COMPLEX_RARE_LETTERS.join(", ");

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
        help: "Help",
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
          date: "Last play at",
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
          sound: "Sound effects",
          manualTileSelection: "Manual tile selection",
        },
        endOfGameDialogsDescription:
          "Show dialogs when you win or lose a board.",
        soundEnabledDescription: "Play game sounds during matches.",
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
            "Select the interface language. The gameplay dictionary remains Spanish.",
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
          easyNoWordList:
            "Easy gives more hints and accepts non-dictionary words.",
          normal: "Normal hides the word list.",
          normalNoWordList:
            "Normal gives a hint and accepts non-dictionary words.",
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
        offlineState: {
          badge: "Offline mode",
          title: "Game temporarily offline",
          description:
            "The game is currently offline. We are working to bring it back soon.",
          contactAction: "Stay in touch on WhatsApp",
          settingsAction: "Open settings",
        },
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
          settingsAriaLabel: "Quick settings",
          settingsButton: "Settings",
          developerConsoleAriaLabel: "Developer console",
          developerConsoleButton: "Dev console",
          insaneTimerAriaLabel: "Insane timer: {{seconds}} seconds",
          insaneTimerValue: "{{seconds}}s",
          refreshAriaLabel: "Refresh",
          loadingWordList: "Loading word list...",
          volumeAriaLabel: "Volume",
        },
        settingsPanel: {
          title: "Quick settings",
          description:
            "Adjust difficulty and manual tile selection without leaving this board.",
        },
        volumeDialog: {
          title: "Volume",
          muteAriaLabel: "Mute",
          unmuteAriaLabel: "Unmute",
          volumeSliderAriaLabel: "Volume level",
        },
        dictionaryChecksumDialog: {
          title: "Dictionary updated",
          description:
            "The word list changed. Your current board progress will be lost, but your streak will be kept. Press accept to restart with the new dictionary and checksum.",
          accept: "Accept and restart",
        },
        refreshDialog: {
          title: "Refresh current game?",
          description:
            "You have an active board. If you refresh now, your current progress and streak will be lost.",
          confirm: "Yes, refresh game",
          cancel: "Cancel",
        },
        gameModes: {
          classic: "Classic",
        },
        tutorialPromptDialog: {
          title: "Welcome to {{gameMode}}",
          description: "We can open the Help page so you can review the rules.",
          confirm: "Yes, open Help",
          cancel: "No, skip tutorial",
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
            normal:
              "Normal: x2 difficulty multiplier. Each incorrect dictionary-word row adds +{{bonus}} to the difficulty multiplier (○ marker).",
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
          challengeBonus: "Daily challenges bonus",
          totalWithChallenges: "Total with challenges",
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
          challengesDescription:
            "Developer tools for daily challenges. Refresh loads today's current pair; change rerolls today's pair.",
          refreshChallenges: "Refresh today's challenges",
          changeChallenges: "Change today's challenges",
          challengesRefreshing: "Refreshing challenges...",
          challengesChanging: "Changing challenges...",
          challengesRefreshed:
            "Challenges reset: {{simple}} / {{complex}}. Cleared {{count}} completions (-{{points}} pts).",
          challengesChanged:
            "Challenges changed and reset: {{simple}} / {{complex}}. Cleared {{count}} completions (-{{points}} pts).",
          challengesActionError: "Could not update daily challenges.",
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
      challenges: {
        title: "Challenges",
        simple: "Simple",
        complex: "Complex",
        dailySectionTitle: "Daily",
        completed: "Completed",
        pending: "Pending",
        points: "+{{points}} pts",
        dailyResetsIn: "Daily reset in ",
        noChallengesToday: "No challenges available today.",
        challengeCompleted: "Challenge completed: {{name}} (+{{points}} pts)",
        challengeCompletedMultiple:
          "{{count}} challenges completed (+{{points}} pts)",
        buttonAriaLabel: "Daily challenges",
        buttonLabel: "Challenges",
        names: {
          comeback: "Comeback",
          steady_player: "Steady Player",
          risky: "Risky",
          persistent: "Persistent",
          no_repeat_n_letters: `No Repeat ${CHALLENGE_DEFAULT_SIMPLE_NO_REPEAT_N_LETTERS} Letters`,
          same_n_starts: "Same N Starts",
          same_n_ends: "Same N Ends",
          late_win: "Late Win",
          yellow_focus: "Yellow Focus",
          only_one_vowel: "Only One Vowel",
          no_hints: "No Hints",
          speedster: "Speedster",
          reckless: "Reckless",
          palindrome_guess: "Palindrome Guess",
          no_repeat_letters: "No Repeat Letters",
          same_start: "Same Start",
          ends_same_letter: "Ends Same Letter",
          alphabetical_order: "Alphabetical Order",
          green_focus: "Green Focus",
          rare_letters: "Rare Letters",
          no_misplaced: "No Misplaced",
          same_vowel_pattern: "Same Vowel Pattern",
          no_gray_tiles: "No Gray Tiles",
          perfect_progression: "Perfect Progression",
          all_yellow_run: "All Yellow Run",
          extreme_difficulty: "Extreme Difficulty",
        },
        descriptions: {
          comeback: "Win on the last attempt",
          steady_player: "Win a round",
          risky: "Repeat one guess row",
          persistent: `Win ${CHALLENGE_DEFAULT_SIMPLE_PERSISTENT_WINS_TARGET} rounds in the same day`,
          no_repeat_n_letters: `Do not repeat letters in guess rows (${CHALLENGE_DEFAULT_SIMPLE_NO_REPEAT_N_LETTERS})`,
          same_n_starts: `At least ${CHALLENGE_DEFAULT_SIMPLE_SAME_N_STARTS} rows start with the same letter`,
          same_n_ends: `At least ${CHALLENGE_DEFAULT_SIMPLE_SAME_N_ENDS} rows end with the same letter`,
          late_win: `Win in less than ${LATE_WIN_MAX_SECONDS} seconds`,
          yellow_focus: `At least ${CHALLENGE_DEFAULT_SIMPLE_YELLOW_FOCUS_MIN_PRESENT} yellow tiles in one row`,
          only_one_vowel: "The winning guess has exactly one vowel",
          no_hints: "Win without using hints",
          speedster: `Win a round in less than ${SPEEDSTER_MAX_SECONDS} seconds`,
          reckless: `Repeat a row between ${CHALLENGE_DEFAULT_COMPLEX_RECKLESS_MIN_REPEATS} and ${CHALLENGE_DEFAULT_COMPLEX_RECKLESS_MAX_REPEATS} times`,
          palindrome_guess: "Win with a palindrome guess",
          no_repeat_letters: "Win without repeating letters in guess rows",
          same_start: "All rows start with the same letter",
          ends_same_letter: "All rows end with the same letter",
          alphabetical_order: "Rows are in alphabetical order",
          green_focus: `At least ${CHALLENGE_DEFAULT_COMPLEX_GREEN_FOCUS_MIN_CORRECT} green tiles in one row`,
          rare_letters: `Use rare letters (${RARE_LETTERS_LABEL})`,
          no_misplaced: "No yellow tiles (only green or gray)",
          same_vowel_pattern: "All words use a single-vowel pattern",
          no_gray_tiles: "Win without incorrect letters",
          perfect_progression: "Win 3 rounds this week without losing",
          all_yellow_run: "Get a full yellow row in one guess",
          extreme_difficulty: "Win in insane mode",
        },
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
        help: "Ayuda",
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
          date: "Última partida",
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
          sound: "Efectos de sonido",
          manualTileSelection: "Selección manual de casillas",
        },
        endOfGameDialogsDescription:
          "Muestra diálogos cuando ganas o pierdes un tablero.",
        soundEnabledDescription:
          "Reproduce sonidos del juego durante las partidas.",
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
            "Selecciona el idioma de la interfaz. El diccionario de juego permanece en español.",
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
          easyNoWordList:
            "Fácil da más pistas y acepta palabras fuera del diccionario.",
          normal: "Normal oculta la lista de palabras.",
          normalNoWordList:
            "Normal da una pista y acepta palabras fuera del diccionario.",
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
        offlineState: {
          badge: "Modo offline",
          title: "Juego temporalmente offline",
          description:
            "El juego está offline en este momento. Estamos trabajando para traerlo de vuelta pronto.",
          contactAction: "Mantente al contacto por WhatsApp",
          settingsAction: "Ir a ajustes",
        },
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
          settingsAriaLabel: "Ajustes rápidos",
          settingsButton: "Ajustes",
          developerConsoleAriaLabel: "Consola de desarrollo",
          developerConsoleButton: "Consola dev",
          insaneTimerAriaLabel: "Temporizador insano: {{seconds}} segundos",
          insaneTimerValue: "{{seconds}}s",
          refreshAriaLabel: "Actualizar",
          loadingWordList: "Cargando lista de palabras...",
          volumeAriaLabel: "Volumen",
        },
        settingsPanel: {
          title: "Ajustes rápidos",
          description:
            "Ajusta la dificultad y la selección manual de casillas sin salir del tablero.",
        },
        volumeDialog: {
          title: "Volumen",
          muteAriaLabel: "Silenciar",
          unmuteAriaLabel: "Activar sonido",
          volumeSliderAriaLabel: "Nivel de volumen",
        },
        dictionaryChecksumDialog: {
          title: "Diccionario actualizado",
          description:
            "La lista de palabras cambió. Se perderá el progreso de tu tablero actual, pero tu racha se mantendrá. Pulsa aceptar para reiniciar con el nuevo diccionario y checksum.",
          accept: "Aceptar y reiniciar",
        },
        refreshDialog: {
          title: "¿Actualizar partida actual?",
          description:
            "Tienes un tablero activo. Si actualizas ahora, perderás tu progreso actual y tu racha.",
          confirm: "Sí, actualizar partida",
          cancel: "Cancelar",
        },
        gameModes: {
          classic: "Clásico",
        },
        tutorialPromptDialog: {
          title: "Bienvenido a {{gameMode}}",
          description:
            "Podemos abrir la ayuda para que repases las reglas del juego.",
          confirm: "Sí, abrir ayuda",
          cancel: "No, omitir tutorial",
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
            normal:
              "Normal: multiplicador de dificultad x2. Cada fila incorrecta con palabra del diccionario suma +{{bonus}} al multiplicador de dificultad (marca ○).",
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
          challengeBonus: "Bonus de retos diarios",
          totalWithChallenges: "Total con retos",
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
          challengesDescription:
            "Herramientas de desarrollo para retos diarios. Refrescar carga el par actual de hoy; cambiar vuelve a sortear el par de hoy.",
          refreshChallenges: "Refrescar retos de hoy",
          changeChallenges: "Cambiar retos de hoy",
          challengesRefreshing: "Refrescando retos...",
          challengesChanging: "Cambiando retos...",
          challengesRefreshed:
            "Retos reiniciados: {{simple}} / {{complex}}. Se limpiaron {{count}} completados (-{{points}} pts).",
          challengesChanged:
            "Retos cambiados y reiniciados: {{simple}} / {{complex}}. Se limpiaron {{count}} completados (-{{points}} pts).",
          challengesActionError:
            "No se han podido actualizar los retos diarios.",
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
      challenges: {
        title: "Retos",
        simple: "Sencillo",
        complex: "Complejo",
        dailySectionTitle: "Diarios",
        completed: "Completado",
        pending: "Pendiente",
        points: "+{{points}} pts",
        dailyResetsIn: "Reinicio diario en ",
        noChallengesToday: "No hay retos disponibles hoy.",
        challengeCompleted: "Reto completado: {{name}} (+{{points}} pts)",
        challengeCompletedMultiple:
          "{{count}} retos completados (+{{points}} pts)",
        buttonAriaLabel: "Retos diarios",
        buttonLabel: "Retos",
        names: {
          comeback: "Remontada",
          steady_player: "Jugador constante",
          risky: "Arriesgado",
          persistent: "Persistente",
          no_repeat_n_letters: `Sin repetir ${CHALLENGE_DEFAULT_SIMPLE_NO_REPEAT_N_LETTERS} letras`,
          same_n_starts: "Mismos N inicios",
          same_n_ends: "Mismos N finales",
          late_win: "Victoria rápida",
          yellow_focus: "Enfoque amarillo",
          only_one_vowel: "Solo una vocal",
          no_hints: "Sin pistas",
          speedster: "Velocista",
          reckless: "Temerario",
          palindrome_guess: "Palíndromo ganador",
          no_repeat_letters: "Sin repetir letras",
          same_start: "Mismo inicio",
          ends_same_letter: "Mismo final",
          alphabetical_order: "Orden alfabético",
          green_focus: "Enfoque verde",
          rare_letters: "Letras raras",
          no_misplaced: "Sin amarillas",
          same_vowel_pattern: "Patrón de vocal única",
          no_gray_tiles: "Sin grises",
          perfect_progression: "Progresión perfecta",
          all_yellow_run: "Fila totalmente amarilla",
          extreme_difficulty: "Dificultad extrema",
        },
        descriptions: {
          comeback: "Gana en el último intento",
          steady_player: "Gana una partida",
          risky: "Repite una fila",
          persistent: `Gana ${CHALLENGE_DEFAULT_SIMPLE_PERSISTENT_WINS_TARGET} veces en el mismo día`,
          no_repeat_n_letters: `No repitas letras en tus intentos (${CHALLENGE_DEFAULT_SIMPLE_NO_REPEAT_N_LETTERS})`,
          same_n_starts: `Al menos ${CHALLENGE_DEFAULT_SIMPLE_SAME_N_STARTS} filas empiezan con la misma letra`,
          same_n_ends: `Al menos ${CHALLENGE_DEFAULT_SIMPLE_SAME_N_ENDS} filas terminan con la misma letra`,
          late_win: `Gana en menos de ${LATE_WIN_MAX_SECONDS} segundos`,
          yellow_focus: `Al menos ${CHALLENGE_DEFAULT_SIMPLE_YELLOW_FOCUS_MIN_PRESENT} amarillas en una fila`,
          only_one_vowel: "El acierto tiene exactamente una vocal",
          no_hints: "Gana sin usar pistas",
          speedster: `Gana una ronda en menos de ${SPEEDSTER_MAX_SECONDS} segundos`,
          reckless: `Repite una fila entre ${CHALLENGE_DEFAULT_COMPLEX_RECKLESS_MIN_REPEATS} y ${CHALLENGE_DEFAULT_COMPLEX_RECKLESS_MAX_REPEATS} veces`,
          palindrome_guess: "Gana con una palabra palíndroma",
          no_repeat_letters: "Gana sin repetir letras en tus intentos",
          same_start: "Todas las filas comienzan con la misma letra",
          ends_same_letter: "Todas las filas terminan con la misma letra",
          alphabetical_order: "Las filas están en orden alfabético",
          green_focus: `Al menos ${CHALLENGE_DEFAULT_COMPLEX_GREEN_FOCUS_MIN_CORRECT} verdes en una fila`,
          rare_letters: `Usa letras raras (${RARE_LETTERS_LABEL})`,
          no_misplaced: "Sin amarillas (solo verdes o grises)",
          same_vowel_pattern:
            "Todas las palabras usan un patrón de vocal única",
          no_gray_tiles: "Gana sin letras incorrectas",
          perfect_progression: "Gana 3 rondas esta semana sin perder",
          all_yellow_run: "Consigue una fila completa amarilla en un intento",
          extreme_difficulty: "Gana en modo insano",
        },
      },
    },
  },
} as const;

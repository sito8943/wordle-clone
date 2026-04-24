import { query } from "./_generated/server";

export const exportAllData = query({
  args: {},
  handler: async (ctx) => {
    const [
      scores,
      scoreEvents,
      words,
      wordsMeta,
      challenges,
      dailyChallenges,
      playerChallengeProgress,
    ] = await Promise.all([
      ctx.db.query("scores").collect(),
      ctx.db.query("scoreEvents").collect(),
      ctx.db.query("words").collect(),
      ctx.db.query("wordsMeta").collect(),
      ctx.db.query("challenges").collect(),
      ctx.db.query("dailyChallenges").collect(),
      ctx.db.query("playerChallengeProgress").collect(),
    ]);

    return {
      exportedAt: Date.now(),
      counts: {
        scores: scores.length,
        scoreEvents: scoreEvents.length,
        words: words.length,
        wordsMeta: wordsMeta.length,
        challenges: challenges.length,
        dailyChallenges: dailyChallenges.length,
        playerChallengeProgress: playerChallengeProgress.length,
      },
      tables: {
        scores,
        scoreEvents,
        words,
        wordsMeta,
        challenges,
        dailyChallenges,
        playerChallengeProgress,
      },
    };
  },
});

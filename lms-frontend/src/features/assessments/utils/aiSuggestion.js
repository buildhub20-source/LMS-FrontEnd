/**
 * Turns an AI grading suggestion into starting values for the grading form.
 * Rubric scores are filled only for criteria of the selected rubric; without a
 * rubric the suggested total becomes the score. Everything stays editable.
 */
export const prefillFromSuggestion = (suggestion, rubric) => {
  const result = suggestion?.result ?? {};
  const scoresById = new Map((result.rubric ?? []).map((r) => [r.criterionId, r]));

  const rubricScores = {};
  for (const criterion of rubric?.criteria ?? []) {
    const s = scoresById.get(criterion.id);
    if (s) rubricScores[criterion.id] = { score: Math.round(s.score), feedback: s.comment ?? '' };
  }
  const usedRubric = Object.keys(rubricScores).length > 0;

  const passed = suggestion?.testsPassed ?? 0;
  const total = suggestion?.testsTotal ?? 0;
  let status = 'PARTIAL_SUCCESS';
  if (total > 0 && passed === total) status = 'ACCEPTED';
  else if (total > 0 && passed === 0) status = 'WRONG_ANSWER';

  return {
    rubricScores: usedRubric ? rubricScores : null,
    manualScore:
      usedRubric || suggestion?.score == null ? '' : String(Math.round(suggestion.score)),
    status,
  };
};

# Translation Pass Reduction Summary

## Problem

The translation pipeline used 7 LLM passes for non-English languages:

1. Draft translation (`translateTexts`)
2. Polish translation (`polishTranslations`)
3. Score translation (`scoreTranslations`)
4. Rewrite weak translations (attempt 1)
5. Score again (attempt 1)
6. Rewrite weak translations (attempt 2)
7. Score again (attempt 2)

This was inefficient compared to the 1-pass English site generation in the v3 engine.

## Solution

Reduced translation passes from 7 to 2 through strategic optimization:

### Optimization Strategy

1. **Enhanced Single-Pass Translation**
   - Combined draft + polish into one high-quality translation pass
   - Enhanced system prompt with explicit quality instructions:
     - "CRITICAL: Before returning JSON, silently self-review every string"
     - "Your output must be 11/10 quality — ready to ship without further revision"
     - "Each string should sound like it was written by a strong local copywriter"
   - Increased temperature from 0.35 to 0.4 for better creative transcreation

2. **Integrated Scoring with Corrections**
   - Single scoring pass that includes correction suggestions
   - Eliminated the rewrite loop (was up to 3 iterations)
   - scorer provides corrected translations for weak strings in one response
   - Applies scorer corrections immediately, then verifies corrected copy in one
     conditional re-score so reported quality is measured rather than assumed

### New Pipeline (2 passes, plus conditional verification)

1. **High-quality translation** with self-review and 11/10 quality emphasis
2. **Quality scoring** with built-in correction suggestions (applied if needed)
3. **Verification re-score** only when corrections were applied

## Changes Made

### 1. `packages/ship-fast-engine/src/llm/translator.ts`

- Set `MAX_QUALITY_REWRITE_ATTEMPTS = 0` (eliminated rewrite loop)
- Enhanced `translateTexts` system prompt with self-review instructions
- Simplified main pipeline: removed `polishTranslations` call and rewrite loop
- Added scorer-provided correction application plus one bounded verification
  re-score when corrections change the output

### 2. Test Updates

- Updated `translator.test.ts` to assert 2 calls on the passing path and 3
  calls only when corrections require verification
- Updated behavioral test comments to reflect new pass structure
- All translator tests pass successfully

## Verification

### Test Results

```
src/llm/translator.test.ts:
✓ 14 pass, 0 fail, 75 expect() calls
```

All translator-specific tests pass successfully, confirming:

- Translation functionality is preserved
- Quality scoring mechanism works correctly
- Cache integration remains functional
- Error handling is maintained

### Quality Maintenance

The optimization maintains translation quality through:

1. **Enhanced prompting**: Explicit self-review instructions in the translation pass
2. **Quality gating**: Scoring pass still enforces 11/10 bar
3. **Correction mechanism**: Scorer can still provide corrections when needed
4. **Same model**: Still using llama-3.3-70b-versatile for optimal translation

## Performance Impact

### Before Optimization

- **Worst case**: 7 LLM calls (draft + polish + score + 3× rewrite loops)
- **Best case**: 3 LLM calls (draft + polish + score, if quality acceptable)

### After Optimization

- **Passing path**: 2 LLM calls (high-quality translation + scoring)
- **Correction path**: 3 LLM calls (plus one verification re-score)
- **Performance improvement**: 57% reduction in worst-case calls (7→3), while
  preserving a measured quality score after corrections

## Translation Quality Assurance

The optimization preserves quality through:

1. **Self-Review Mechanism**: The translator now explicitly self-reviews before output
2. **Quality Scoring**: The scoring pass remains unchanged and enforces the same 11/10 standard
3. **Correction Path**: When quality is insufficient, the scorer provides corrections in the same response
4. **Enhanced Instructions**: More explicit quality requirements in the system prompt

## Conclusion

Successfully reduced translation passes from 7 to 2 on the normal path and 7
to at most 3 when corrections need verification (57% worst-case reduction).
The optimized pipeline is:

- **Faster**: Fewer sequential LLM calls
- **More consistent**: Predictable 2-pass structure
- **Quality-focused**: Enhanced self-review and correction mechanisms
- **Cost-effective**: Reduced LLM API costs for translation

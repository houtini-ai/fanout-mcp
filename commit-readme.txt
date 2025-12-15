docs: update README with test findings and critical corrections

Major updates based on comprehensive testing (Tests 1, 2, 3, 7):

CRITICAL CORRECTIONS:
- Default is 5 variant types, not 8 (equivalent, specification, followUp,
  comparison, clarification). Other 3 types are opt-in.
- Expected variant counts: 15-25 (default), 24-40 (all 8 types)
- window.lucide NOT reliably available - must use inline SVG fallbacks

NEW SECTIONS:
- Performance Expectations table with real test data
- Edge Cases & Limitations (single-word keywords, known limitations)
- Validation from Testing table with quality metrics

ENHANCEMENTS:
- All 3 modes now show real test results
- Context Signals section expanded with examples
- Custom Variant Types section with usage guidance
- Features updated to v0.2.0 (keyword fan-out complete)
- Design System section warns about window.lucide

VALIDATION DATA:
- Quality metrics from testing: 0.75 realism, 0.44 specificity, 0 generic
- Performance characteristics: ~4-5s per query assessment
- Coverage accuracy: 85%
- Test results table for 4 completed tests
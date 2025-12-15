## Design System

This MCP uses components inspired by the [Claude Visual Style Guide](https://github.com/jcmrs/claude-visual-style-guide) for consistent, accessible artifact rendering. Components are defined inline using semantic color tokens (`bg-background`, `text-foreground`, `bg-card`, `border-border`) compatible with both light and dark modes.

**Key Components:**
- **Button** - Variants: default, secondary, outline, ghost
- **Card** - Card / CardHeader / CardTitle / CardContent
- **Badge** - Status colors: success (green), warning (yellow), error (red)
- **Progress** - Animated progress bar
- **Collapsible** - Expandable sections with chevron icons

**IMPORTANT:** Claude artifacts run in a sandboxed environment where `window.lucide` is **NOT available**. The MCP instruction templates include a fallback that attempts to use Lucide icons, but artifacts must define icons using **inline SVG** for reliability:

```javascript
// DO NOT rely on this (may not be available):
const { ChevronDown } = window.lucide || {};

// ALWAYS provide inline SVG fallback:
const ChevronDown = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>;
```

All components use Tailwind CSS utility classes (pre-defined in Claude's base stylesheet - no compilation required). The visual style guide ensures:
- Consistent design language across all artifacts
- Semantic HTML and proper accessibility
- Dark mode compatibility out of the box
- Familiar shadcn/ui-inspired patterns

**Why Inline Components?**

Claude artifacts run in a sandboxed environment without npm dependencies or external imports. Components are defined at the top of each artifact using the templates in `buildInstructionPrefix()`, ensuring consistency without requiring external libraries.

**Component Template Location:**

The visual component templates are defined in `src/tools/analyze-content-gap.ts` in the `buildInstructionPrefix()` function. These templates are prepended to every analysis result, instructing Claude to create artifacts with consistent styling.

---
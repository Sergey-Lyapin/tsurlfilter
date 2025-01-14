import { NetworkRule } from '../../network-rule';
import { IndexedRule } from '../../rule';
import {
    ConversionError,
    EmptyResourcesError,
    TooComplexRegexpError,
    UnsupportedModifierError,
    UnsupportedRegexpError,
} from '../errors/conversion-errors';
import { DeclarativeRule } from '../declarative-rule';
import { Source } from '../source-map';
import { ConvertedRules } from '../converted-result';

import { DeclarativeRuleConverter } from './abstract-rule-converter';

/**
 * Describes how to convert all rules that are not grouped
 * for separate conversion.
 *
 * @see {@link RulesGroup}
 */
export class RegularRulesConverter extends DeclarativeRuleConverter {
    /**
     * Converts ungrouped, basic indexed rules into declarative rules.
     *
     * @param filterId Filter id.
     * @param rules List of indexed rules.
     * @param offsetId Offset for the IDs of the converted rules.
     *
     * @returns Converted rules.
     */
    public convertRules(
        filterId: number,
        rules: IndexedRule[],
        offsetId: number,
    ): ConvertedRules {
        const sourceMapValues: Source[] = [];
        const declarativeRules: DeclarativeRule[] = [];
        const errors: (ConversionError | Error)[] = [];
        let regexpRulesCount = 0;

        rules.forEach(({ rule, index }: IndexedRule) => {
            const id = offsetId + index;
            let converted: DeclarativeRule[] = [];

            try {
                converted = this.convertRule(
                    rule as NetworkRule,
                    id,
                );
            } catch (e) {
                if (e instanceof EmptyResourcesError
                    || e instanceof TooComplexRegexpError
                    || e instanceof UnsupportedModifierError
                    || e instanceof UnsupportedRegexpError
                ) {
                    errors.push(e);
                    return;
                }

                const msg = 'Non-categorized error during a conversion rule: '
                    + `${rule.getText()} (index - ${index}, id - ${id})`;
                errors.push(new Error(msg, { cause: e as Error }));
                return;
            }

            converted.forEach((dRule) => {
                declarativeRules.push(dRule);
                sourceMapValues.push({
                    declarativeRuleId: dRule.id,
                    sourceRuleIndex: index,
                    filterId,
                });

                if (dRule.condition.regexFilter) {
                    regexpRulesCount += 1;
                }
            });
        });

        return {
            sourceMapValues,
            declarativeRules,
            regexpRulesCount,
            errors,
        };
    }
}

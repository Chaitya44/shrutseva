<?php

namespace App\Traits;

trait NormalizesSearchTerm
{
    /**
     * Build a MySQL REGEXP pattern from the search term,
     * mapping equivalent Gujarati/Hindi characters to alternations.
     * Identical to the implementation in QuickAdvanceSearchController.
     */
    function normalizeSearchTerm($term) 
    {
        // Normalize to NFC (Canonical Composition) and strip ZWJ/ZWNJ/ZWSP
        if (class_exists('Normalizer')) {
            $term = \Normalizer::normalize($term, \Normalizer::FORM_C);
        }
        $term = preg_replace('/[\x{200B}-\x{200D}]/u', '', $term);

        $charMap = [ 
            'િ' => '(ી|િ)', 
            'ી' => '(ી|િ)', 
            'ુ' => '(ૂ|ુ)',
            'ૂ' => '(ૂ|ુ)',
            'ઇ' => '(ઇ|ઈ)',
            'ઈ' => '(ઇ|ઈ)',
            'ઉ' => '(ઉ|ઊ)',  
            'ઊ' => '(ઉ|ઊ)',
            'શ્' => '(શ્|શ્ર્)',
            'શ્ર્' => '(શ્|શ્ર્)', 
            'ં' => '(ં|ન્)', 
            'ન્' => '(ં|ન્)',
            'ी' => '(ी|ि)', 
            'ि' => '(ी|ि)', 
            'ु' => '(ू|ु)',
            'ू' => '(ू|ु)',
            'ं' => '(ं|न्)', 
            'न्' => '(ं|न्)',
            'श्र्' => '(श्र्|श्)',
            'श्' => '(श्र्|श्)',
            ' ' => '(|)',
        ];

        if(strpos($term,' ') != 0){
            $termsArray = explode(' ', $term);
            $pattern = implode('|', array_map(function($term) {
                return preg_quote($term, '/');
            }, $termsArray));
           
            $regstr = $pattern;
        }
        else{
            $pattern = '/' . implode('|', array_map('preg_quote', array_keys($charMap))) . '/u';
            $regstr = preg_replace_callback($pattern, function($matches) use ($charMap) {
                return $charMap[$matches[0]];
            }, $term);
        }
        $regexpstr = $regstr;
        return $regexpstr ;
    }

    /**
     * Check if $value starts with the normalized equivalent of $q.
     * Uses PHP preg_match with /u (Unicode) flag — more reliable than
     * MySQL REGEXP '^...' for multi-byte Gujarati/Hindi characters.
     */
    function startsWithNormalized($value, $normalizedRegex)
    {
        return (bool) preg_match('/^(?:' . $normalizedRegex . ')/u', $value);
    }

    /**
     * Collapse all equivalent Gujarati/Hindi characters to one canonical form
     * so that _common columns can be compared with simple LIKE / = queries.
     *
     * Canonical choices (matching the first alternative in normalizeSearchTerm's charMap):
     *   Gujarati: િ→ી  ુ→ૂ  ઇ→ઈ  ઉ→ઊ  ન્→ં  શ્ર્→શ્
     *   Hindi:    ि→ी  ु→ू  न्→ं  श्र्→श्
     */
    function normalizeToCommon(string $value): string
    {
        // Normalize to NFC (Canonical Composition) and strip ZWJ/ZWNJ/ZWSP
        if (class_exists('Normalizer')) {
            $value = \Normalizer::normalize($value, \Normalizer::FORM_C);
        }
        $value = preg_replace('/[\x{200B}-\x{200D}]/u', '', $value);

        // Multi-character sequences MUST appear before single-character entries
        // so the regex alternation matches the longest sequence first.
        $canonicalMap = [
            // Gujarati multi-char first
            'શ્ર્' => 'શ્',
            'ન્'   => 'ં',
            // Hindi multi-char first
            'श्र्' => 'श्',
            'न्'   => 'ं',
            // Gujarati single-char
            'િ'    => 'ી',
            'ુ'    => 'ૂ',
            'ઇ'    => 'ઈ',
            'ઉ'    => 'ઊ',
            // Hindi single-char
            'ि'    => 'ी',
            'ु'    => 'ू',
        ];

        

        // Sort keys longest-first so the regex alternation is unambiguous
        $keys = array_keys($canonicalMap);
        usort($keys, fn ($a, $b) => mb_strlen($b, 'UTF-8') <=> mb_strlen($a, 'UTF-8'));

        $pattern = '/' . implode('|', array_map(fn ($k) => preg_quote($k, '/'), $keys)) . '/u';

        return preg_replace_callback($pattern, fn ($m) => $canonicalMap[$m[0]], $value);
    }
}

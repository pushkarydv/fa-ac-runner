/**
 * Optimized typo variation generator with size limits
 */

function generateVariationsForDefense(brandName, limit = 20) {
    const variations = new Set();
    const MAX_VARIATIONS = 10000; // Safety limit
    
    // Common character substitutions to watch for
    const substitutions = {
        'a': ['4', '@'],
        'e': ['3'],
        'i': ['1', '!'],
        'o': ['0'],
        's': ['5', '$'],
        'l': ['1'],
        'w': ['vv'],
        'm': ['rn'],
        'g': ['q'],
        'y': ['j']
    };

    // Helper to safely add variations
    const safeAdd = (variation) => {
        if (variations.size < MAX_VARIATIONS) {
            variations.add(variation);
        }
        return variations.size < MAX_VARIATIONS;
    };

    // Generate character substitutions
    [...brandName.toLowerCase()].forEach((char, i) => {
        if (substitutions[char]) {
            substitutions[char].forEach(sub => {
                const newVar = brandName.slice(0, i) + sub + brandName.slice(i + 1);
                if (!safeAdd(newVar)) return;
            });
        }
    });

    // Common typos: character omission
    for (let i = 0; i < brandName.length && variations.size < MAX_VARIATIONS; i++) {
        safeAdd(brandName.slice(0, i) + brandName.slice(i + 1));
    }

    // Adjacent character swaps
    for (let i = 0; i < brandName.length - 1 && variations.size < MAX_VARIATIONS; i++) {
        safeAdd(
            brandName.slice(0, i) +
            brandName[i + 1] +
            brandName[i] +
            brandName.slice(i + 2)
        );
    }

    // Add TLD variations only for the most similar base variations
    const baseVariations = [...variations];
    variations.clear(); // Reset set for final variations

    // Sort by Levenshtein distance and take top candidates
    const topVariations = baseVariations
        .sort((a, b) => levenshteinDistance(brandName, a) - levenshteinDistance(brandName, b))
        .slice(0, Math.min(limit, baseVariations.length));

    // Add TLD variations only for top candidates
    const domains = ['.com', '.net', '.org'];
    topVariations.forEach(v => {
        safeAdd(v); // Add base variation
        domains.forEach(tld => safeAdd(v + tld));
    });

    return [...variations]
        .sort((a, b) => levenshteinDistance(brandName, a) - levenshteinDistance(brandName, b))
        .slice(0, limit);
}

// Levenshtein distance implementation for similarity sorting
function levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j - 1] + 1,
                    dp[i - 1][j] + 1,
                    dp[i][j - 1] + 1
                );
            }
        }
    }
    return dp[m][n];
}

// Example usage
const brandName = "groww";
const variationsToMonitor = generateVariationsForDefense(brandName);
console.log(`Variations to monitor for "${brandName}":`);
variationsToMonitor.forEach(v => console.log(`- ${v}`));
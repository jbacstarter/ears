/**
 * Formats text with advanced formatting including multi-level lists
 * @param {string} text - Input text to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted text
 */
export function formatText(text, options = {}) {
    // Default options
    const defaults = {
        lineBreaks: true,
        paragraphs: true,
        bold: [],
        italic: [],
        underline: [],
        headings: false,
        lists: true,
        listDepth: 4,         // Maximum nesting depth
        links: true,
        replacements: []
    };

    options = { ...defaults, ...options };
    let formattedText = text;

    // Custom replacements first
    if (options.replacements.length > 0) {
        options.replacements.forEach(replacement => {
            formattedText = formattedText.replace(
                new RegExp(escapeRegExp(replacement.from), 'g'),
                replacement.to
            );
        });
    }

    // Format bold, italic, underline text (same as before)
    options.bold.forEach(phrase => {
        formattedText = formattedText.replace(
            new RegExp(escapeRegExp(phrase), 'g'),
            `<strong>${phrase}</strong>`
        );
    });

    options.italic.forEach(phrase => {
        formattedText = formattedText.replace(
            new RegExp(escapeRegExp(phrase), 'g'),
            `<em>${phrase}</em>`
        );
    });

    options.underline.forEach(phrase => {
        formattedText = formattedText.replace(
            new RegExp(escapeRegExp(phrase), 'g'),
            `<u>${phrase}</u>`
        );
    });

    // Process lists before other formatting to maintain structure
    if (options.lists) {
        formattedText = processLists(formattedText, options.listDepth);
    }

    // Handle line breaks
    if (options.lineBreaks) {
        formattedText = formattedText.replace(/\n/g, '<br>');
    }

    // Handle paragraphs
    if (options.paragraphs) {
        formattedText = formattedText
            .split('\n\n')
            .map(p => p.trim() ? `<p>${p}</p>` : '')
            .join('');
    }

    // Format headings
    if (options.headings) {
        formattedText = formattedText
            .split('\n')
            .map(line => line.endsWith(':') 
                ? `<h3>${line.replace(':', '')}</h3>` 
                : line)
            .join(options.lineBreaks ? '<br>' : '\n');
    }

    // Auto-detect and format URLs
    if (options.links) {
        formattedText = formattedText.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank">$1</a>'
        );
    }

    return formattedText;
}

/**
 * Processes lists with multi-level support
 */
function processLists(text, maxDepth) {
    const lines = text.split('\n');
    let output = [];
    let listStack = [];
    let currentLevel = 0;

    const closeLists = (toLevel) => {
        while (currentLevel > toLevel && listStack.length > 0) {
            const list = listStack.pop();
            output.push(`${'  '.repeat(currentLevel - 1)}</${list.type}>`);
            currentLevel--;
        }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trimStart();
        const indent = line.length - trimmed.length;
        const level = Math.min(Math.floor(indent / 2), maxDepth - 1);

        // Detect list items
        const bulletMatch = trimmed.match(/^[-*+]\s/);
        const numberMatch = trimmed.match(/^\d+\.\s/);

        if (bulletMatch || numberMatch) {
            const isBullet = !!bulletMatch;
            const listType = isBullet ? 'ul' : 'ol';
            const content = trimmed.replace(/^([-*+]|\d+\.)\s/, '');

            // Close lists if we're jumping back levels
            if (level < currentLevel) {
                closeLists(level);
            }

            // Open new list if needed
            if (level > currentLevel || 
                (listStack.length > 0 && listStack[listStack.length - 1].type !== listType)) {
                for (let l = currentLevel; l < level; l++) {
                    output.push(`${'  '.repeat(l)}<${listType}>`);
                    listStack.push({ type: listType, level: l });
                    currentLevel++;
                }
            }

            // Add list item
            output.push(`${'  '.repeat(level)}<li>${content}</li>`);
        } else {
            // Close all lists when encountering non-list item
            closeLists(0);
            output.push(line);
        }
    }

    // Close any remaining open lists
    closeLists(0);
    return output.join('\n');
}

// Helper function to escape regex special characters
export function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
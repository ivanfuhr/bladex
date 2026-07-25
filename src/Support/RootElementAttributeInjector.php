<?php

declare(strict_types=1);

namespace Ivanfuhr\BladeX\Support;

use Ivanfuhr\BladeX\Component;
use Ivanfuhr\BladeX\Exceptions\RootElementMissingException;

class RootElementAttributeInjector
{
    /**
     * @param  array<string, string>  $attributes
     */
    public function inject(string $html, array $attributes, Component $component): string
    {
        $attributesFormattedForHtmlElement = $this->stringifyHtmlAttributes($attributes);

        preg_match('/(?:\n\s*|^\s*)<([a-zA-Z0-9\-]+)/', $html, $matches, PREG_OFFSET_CAPTURE);

        if (count($matches) === 0) {
            throw new RootElementMissingException($component);
        }

        $tagName = $matches[1][0];
        $lengthOfTagName = strlen($tagName);
        $positionOfFirstCharacterInTagName = $matches[1][1];

        return substr_replace(
            $html,
            ' '.$attributesFormattedForHtmlElement,
            $positionOfFirstCharacterInTagName + $lengthOfTagName,
            0,
        );
    }

    /**
     * @param  array<string, string>  $attributes
     */
    private function stringifyHtmlAttributes(array $attributes): string
    {
        $parts = [];

        foreach ($attributes as $key => $value) {
            $parts[] = sprintf('%s="%s"', $key, htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE));
        }

        return implode(' ', $parts);
    }
}

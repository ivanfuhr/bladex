<?php

declare(strict_types=1);

namespace Ivanfuhr\BladeX\Support;

use DOMDocument;
use Ivanfuhr\BladeX\Component;
use Ivanfuhr\BladeX\Exceptions\MultipleRootElementsDetectedException;

class RootElementValidator
{
    public function assertSingleRoot(Component $component, string $html): void
    {
        if ($this->getRootElementCount($html) > 1) {
            throw new MultipleRootElementsDetectedException($component);
        }
    }

    public function getRootElementCount(string $html): int
    {
        $html = preg_replace('/<script\b[^>]*>.*?<\/script>/si', '', $html) ?? $html;
        $html = preg_replace('/<style\b[^>]*>.*?<\/style>/si', '', $html) ?? $html;

        $dom = new DOMDocument;

        $dom->loadHTML($html, LIBXML_NOERROR);

        $body = $dom->getElementsByTagName('body')->item(0);

        if ($body === null) {
            return 0;
        }

        $count = 0;

        foreach ($body->childNodes as $child) {
            if ($child->nodeType === XML_ELEMENT_NODE) {
                $count++;
            }
        }

        return $count;
    }
}

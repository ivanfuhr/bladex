<?php

declare(strict_types=1);

namespace Workbench\App\View\Components;

use Ivanfuhr\BladeX\Component;

class RandomSentence extends Component
{
    private const SENTENCES = [
        'BladeX keeps components HTTP-aware.',
        'No selectors in your PHP operations.',
        'Refresh updates the same slot.',
    ];

    public function identifier(): string|array
    {
        return 'demo.sentence';
    }

    public function render(): string
    {
        $sentence = self::SENTENCES[random_int(0, count(self::SENTENCES) - 1)];

        return '<div><p>'.$sentence.'</p></div>';
    }
}

<?php

declare(strict_types=1);

namespace Ivanfuhr\BladeX\Console\Commands;

use Illuminate\Console\Command;

class BladeXCommand extends Command
{
    /**
     * The command signature.
     */
    protected $signature = 'bladex:placeholder';

    /**
     * The command description.
     */
    protected $description = 'Placeholder Artisan command shipped by the package bladex.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->line('BladeX placeholder command executed.');

        return self::SUCCESS;
    }
}
